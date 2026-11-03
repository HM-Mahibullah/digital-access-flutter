"""
Raspberry Pi 5 + USB webcam + YOLO -> Authorized / Unauthorized person detection
Flask MJPEG server

Endpoints:
  GET /video_feed  -> box + নামসহ লাইভ ভিডিও (MJPEG)
  GET /status      -> {"fps": 8.2, "detections": [
                         {"name": "Tanmoy", "status": "authorized", "conf": 0.91},
                         {"name": null, "status": "unauthorized", "conf": 0.38}]}

নিয়ম:
  - আপনার মডেল কোনো ব্যক্তিকে --auth-conf (ডিফল্ট 0.65) এর বেশি নিশ্চয়তায় চিনলে -> AUTHORIZED (নামসহ)
  - কম নিশ্চয়তা হলে (মডেল নিশ্চিত নয়) -> UNAUTHORIZED
  - (ঐচ্ছিক) --person-model yolo26n.pt দিলে সাধারণ "person" detector-ও চলবে।
    যে মানুষকে আপনার মডেল চিনতেই পারেনি, তাকেও UNAUTHORIZED দেখাবে।

চালানো:
  python server.py --model best_ncnn_model
  python server.py --model best_ncnn_model --person-model yolo26n_ncnn_model
"""
import argparse
import threading
import time

import cv2
from flask import Flask, Response, jsonify
from ultralytics import YOLO

AUTHORIZED = {
    "Tanmoy", "Bashar", "Sakib", "Kaiyum", "MH_Nazmul", "Jobayer", "Tanjil",
    "Sifat", "Noyim", "Mamun", "Jihad", "Milon", "Sharafat", "Tanvir",
    "Safayet", "Rahat", "Senarul", "Meheraj", "Fahim", "Dipjoy", "Ontor",
    "Nazrul", "Boloram", "Apurbo", "Amit", "Prosenjit",
    # "Mahibullah" ইচ্ছা করে বাদ: মডেল চিনলেও তাকে UNAUTHORIZED দেখাবে
}

parser = argparse.ArgumentParser()
parser.add_argument("--model", default="best_ncnn_model", help="আপনার trained best.pt বা NCNN folder")
parser.add_argument("--person-model", default=None, help="(ঐচ্ছিক) সাধারণ COCO YOLO, অচেনা মানুষ ধরার জন্য")
parser.add_argument("--camera", type=int, default=0, help="USB webcam index (/dev/video0 -> 0)")
parser.add_argument("--imgsz", type=int, default=416)
parser.add_argument("--min-conf", type=float, default=0.30, help="এর নিচে detection বাদ")
parser.add_argument("--auth-conf", type=float, default=0.65, help="এর উপরে হলে Authorized")
parser.add_argument("--width", type=int, default=640)
parser.add_argument("--height", type=int, default=480)
parser.add_argument("--port", type=int, default=5000)
args = parser.parse_args()

app = Flask(__name__)
model = YOLO(args.model, task="detect")
person_model = YOLO(args.person_model, task="detect") if args.person_model else None

lock = threading.Lock()
latest_jpeg = None
latest_status = {"fps": 0.0, "detections": []}

GREEN = (0, 200, 0)
RED = (0, 0, 255)


def draw(frame, box, text, color):
    x1, y1, x2, y2 = box
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
    y = max(y1, th + 8)
    cv2.rectangle(frame, (x1, y - th - 8), (x1 + tw + 4, y), color, -1)
    cv2.putText(frame, text, (x1 + 2, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)


def center_inside(inner, outer):
    cx, cy = (inner[0] + inner[2]) / 2, (inner[1] + inner[3]) / 2
    return outer[0] <= cx <= outer[2] and outer[1] <= cy <= outer[3]


def process(frame):
    detections = []
    known_boxes = []

    # ১) আপনার মডেল: কে এই ব্যক্তি?
    res = model.predict(frame, imgsz=args.imgsz, conf=args.min_conf, verbose=False)[0]
    for b in res.boxes:
        name = res.names[int(b.cls)]
        conf = float(b.conf)
        box = tuple(map(int, b.xyxy[0]))
        known_boxes.append(box)
        if name in AUTHORIZED and conf >= args.auth_conf:
            draw(frame, box, f"AUTHORIZED: {name} {conf:.2f}", GREEN)
            detections.append({"name": name, "status": "authorized", "conf": round(conf, 3)})
        else:
            draw(frame, box, f"UNAUTHORIZED {conf:.2f}", RED)
            detections.append({"name": None, "status": "unauthorized", "conf": round(conf, 3)})

    # ২) (ঐচ্ছিক) সাধারণ person detector: যাকে আপনার মডেল ধরেইনি
    if person_model is not None:
        pres = person_model.predict(frame, imgsz=args.imgsz, conf=0.5, classes=[0], verbose=False)[0]
        for b in pres.boxes:
            pbox = tuple(map(int, b.xyxy[0]))
            if any(center_inside(k, pbox) for k in known_boxes):
                continue
            conf = float(b.conf)
            draw(frame, pbox, f"UNAUTHORIZED {conf:.2f}", RED)
            detections.append({"name": None, "status": "unauthorized", "conf": round(conf, 3)})

    return detections


def capture_loop():
    global latest_jpeg, latest_status
    cap = cv2.VideoCapture(args.camera, cv2.CAP_V4L2)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, args.width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, args.height)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    prev = time.time()
    fps = 0.0
    while True:
        ok, frame = cap.read()
        if not ok:
            print("Camera frame পাওয়া যায়নি, আবার চেষ্টা...")
            time.sleep(1)
            cap.release()
            cap = cv2.VideoCapture(args.camera, cv2.CAP_V4L2)
            continue

        detections = process(frame)

        now = time.time()
        fps = 0.9 * fps + 0.1 * (1.0 / max(now - prev, 1e-6))
        prev = now
        cv2.putText(frame, f"FPS {fps:.1f}", (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

        ok, jpg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
        if ok:
            with lock:
                latest_jpeg = jpg.tobytes()
                latest_status = {"fps": round(fps, 1), "detections": detections}


def mjpeg_generator():
    last = None
    while True:
        with lock:
            jpg = latest_jpeg
        if jpg is None or jpg is last:
            time.sleep(0.01)
            continue
        last = jpg
        yield (b"--frame\r\nContent-Type: image/jpeg\r\n"
               b"Content-Length: " + str(len(jpg)).encode() + b"\r\n\r\n" + jpg + b"\r\n")


@app.after_request
def add_cors(resp):
    # Flutter web (Chrome) থেকেও যেন app server পড়তে পারে
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


@app.route("/video_feed")
def video_feed():
    return Response(mjpeg_generator(), mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/status")
def status():
    with lock:
        return jsonify(latest_status)


@app.route("/")
def index():
    return '<h3>Digital Access Camera</h3><img src="/video_feed" style="max-width:100%">'


if __name__ == "__main__":
    print("Model classes:", model.names)
    threading.Thread(target=capture_loop, daemon=True).start()
    app.run(host="0.0.0.0", port=args.port, threaded=True)
