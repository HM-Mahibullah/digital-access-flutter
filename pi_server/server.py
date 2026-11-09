"""
Raspberry Pi 5 + USB webcam + YOLO -> Authorized / Unauthorized person detection
Flask MJPEG server

Endpoints:
  GET /video_feed  -> box + নামসহ লাইভ ভিডিও (MJPEG)
  GET /status      -> {"fps": 8.2, "detections": [
                         {"name": "Tanmoy", "status": "authorized", "conf": 0.91},
                         {"name": null, "status": "unauthorized", "conf": 0.38, "reason": "low conf"}]}

নিয়ম:
  - মডেলে যাদের train করা হয়েছে (২৭ জন), ডিফল্টে সবাই AUTHORIZED।
    কাউকে বাদ দিতে কোড বদলাতে হবে না, শুধু: --deny Mahibullah
  - মডেল কাউকে --auth-conf (ডিফল্ট 0.55) বা তার বেশি নিশ্চয়তায় চিনলে -> AUTHORIZED (নামসহ)
  - কম নিশ্চয়তা হলে -> UNAUTHORIZED
  - একবার নিশ্চিতভাবে চেনার পর --hold (ডিফল্ট 2 সেকেন্ড) পর্যন্ত একই জায়গার মানুষকে
    একই নামে ধরে রাখে। ফলে আলো একটু কমলে বা এক-দুই frame মিস হলে লাল-সবুজ লাফালাফি করে না।
  - (ঐচ্ছিক) --person-model দিলে সাধারণ "person" detector-ও চলে;
    যার মুখ চেনা যায়নি, তাকেও UNAUTHORIZED দেখায়।

চালানো:
  python server.py --model best_ncnn_model --person-model yolo26n_ncnn_model --camera 0 --imgsz 640
"""
import argparse
import logging
import subprocess
import threading
import time

import cv2
from flask import Flask, Response, jsonify
from ultralytics import YOLO

VERSION = "2026-11-09"

parser = argparse.ArgumentParser()
parser.add_argument("--model", default="best_ncnn_model", help="আপনার trained best.pt বা NCNN folder")
parser.add_argument("--person-model", default=None, help="(ঐচ্ছিক) সাধারণ COCO YOLO, অচেনা মানুষ ধরার জন্য")
parser.add_argument("--camera", type=int, default=0, help="USB webcam index (/dev/video0 -> 0)")
parser.add_argument("--imgsz", type=int, default=640, help="মডেল যে size-এ train/export করা, সেটাই দিন")
parser.add_argument("--min-conf", type=float, default=0.30, help="এর নিচে detection বাদ")
parser.add_argument("--auth-conf", type=float, default=0.55, help="এর সমান বা বেশি হলে Authorized")
parser.add_argument("--hold", type=float, default=2.0, help="নিশ্চিতভাবে চেনার পর কত সেকেন্ড পরিচয় ধরে রাখবে (0 = বন্ধ)")
parser.add_argument("--deny", nargs="*", default=[], help="মডেল চিনলেও যাদের UNAUTHORIZED দেখাবে, যেমন: --deny Mahibullah")
parser.add_argument("--width", type=int, default=640)
parser.add_argument("--height", type=int, default=480)
parser.add_argument("--port", type=int, default=5000)
args = parser.parse_args()

app = Flask(__name__)
model = YOLO(args.model, task="detect")
person_model = YOLO(args.person_model, task="detect") if args.person_model else None

# মডেলের সব ব্যক্তি authorized, শুধু --deny তালিকার মানুষ বাদ।
# (আলাদা করে হাতে লেখা তালিকা নেই, তাই বানান না মেলার ঝামেলাও নেই)
MODEL_NAMES = set(model.names.values())
AUTHORIZED = MODEL_NAMES - set(args.deny)

lock = threading.Lock()
latest_jpeg = None
latest_status = {"version": VERSION, "fps": 0.0, "detections": []}

# সম্প্রতি নিশ্চিতভাবে চেনা মানুষ: {"name", "box", "conf", "t"} (শুধু capture thread ব্যবহার করে)
tracks = []

GREEN = (0, 200, 0)
RED = (0, 0, 255)


class _HideRequestLogs(logging.Filter):
    """প্রতি সেকেন্ডের /status request log লুকাই, যাতে terminal-এ আসল ফলাফল পড়া যায়।"""

    def filter(self, record):
        msg = record.getMessage()
        return "GET /status" not in msg and "GET /video_feed" not in msg


logging.getLogger("werkzeug").addFilter(_HideRequestLogs())


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


def iou(a, b):
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0]))
    iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = ix * iy
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / union if union > 0 else 0.0


def recent_identity(box, now, person_box=False):
    """এই জায়গায় গত --hold সেকেন্ডের মধ্যে কাউকে নিশ্চিতভাবে চেনা গিয়েছিল কি? গেলে সেই track ফেরত দেয়।"""
    best = None
    for tr in tracks:
        if now - tr["t"] > args.hold:
            continue
        same_place = center_inside(tr["box"], box) if person_box else iou(tr["box"], box) > 0.3
        if same_place and (best is None or tr["t"] > best["t"]):
            best = tr
    return best


def mark_authorized(frame, detections, box, name, conf, held=False):
    draw(frame, box, f"AUTHORIZED: {name} {conf:.2f}", GREEN)
    detections.append({"name": name, "status": "authorized", "conf": round(conf, 3), "held": held})


def mark_unauthorized(frame, detections, box, conf, reason, guess=None):
    who = f"{guess} " if guess else ""
    draw(frame, box, f"UNAUTHORIZED ({who}{conf:.2f}, {reason})", RED)
    detections.append({"name": None, "guess": guess, "status": "unauthorized",
                       "conf": round(conf, 3), "reason": reason})


def process(frame, now=None):
    now = time.time() if now is None else now
    tracks[:] = [t for t in tracks if now - t["t"] <= args.hold]
    detections = []
    face_boxes = []

    # ১) আপনার মডেল: কে এই ব্যক্তি? (agnostic NMS: একই মুখে একাধিক নাম আসবে না)
    res = model.predict(frame, imgsz=args.imgsz, conf=args.min_conf, agnostic_nms=True, verbose=False)[0]
    found = sorted(((res.names[int(b.cls)], float(b.conf), tuple(map(int, b.xyxy[0]))) for b in res.boxes),
                   key=lambda x: -x[1])
    for name, conf, box in found:
        if any(center_inside(box, f) for f in face_boxes):
            continue  # একই মুখের ভেতরে দ্বিতীয় (কম নিশ্চিত) box: বাদ
        face_boxes.append(box)

        if conf >= args.auth_conf:
            # মডেল নিশ্চিত: এই জায়গার পুরনো পরিচয় মুছে নতুনটা রাখি
            tracks[:] = [t for t in tracks if iou(t["box"], box) <= 0.3]
            if name in AUTHORIZED:
                tracks.append({"name": name, "box": box, "conf": conf, "t": now})
                mark_authorized(frame, detections, box, name, conf)
            else:
                mark_unauthorized(frame, detections, box, conf, "access denied", name)
            continue

        # মডেল নিশ্চিত নয়: এক মুহূর্ত আগে এখানে কাউকে নিশ্চিতভাবে চেনা গিয়ে থাকলে সে-ই
        tr = recent_identity(box, now)
        if tr:
            mark_authorized(frame, detections, box, tr["name"], tr["conf"], held=True)
        else:
            mark_unauthorized(frame, detections, box, conf, "low conf", name)

    # ২) (ঐচ্ছিক) সাধারণ person detector: যাদের মুখ আপনার মডেল ধরতেই পারেনি
    if person_model is not None:
        pres = person_model.predict(frame, imgsz=args.imgsz, conf=0.5, classes=[0], verbose=False)[0]
        for b in pres.boxes:
            pbox, pconf = tuple(map(int, b.xyxy[0])), float(b.conf)
            if any(center_inside(f, pbox) for f in face_boxes):
                continue  # এই মানুষের মুখ উপরে আগেই বিচার হয়েছে
            tr = recent_identity(pbox, now, person_box=True)
            if tr:  # এই frame-এ মুখ ধরা পড়েনি, কিন্তু একটু আগেই এখানে তাকে চেনা গিয়েছিল
                mark_authorized(frame, detections, pbox, tr["name"], tr["conf"], held=True)
            else:
                mark_unauthorized(frame, detections, pbox, pconf, "face not recognized")

    return detections


def summary(detections):
    if not detections:
        return "কেউ নেই"
    parts = []
    for d in detections:
        if d["status"] == "authorized":
            parts.append(f"AUTHORIZED {d['name']} {d['conf']:.2f}" + (" (hold)" if d.get("held") else ""))
        else:
            who = f"{d['guess']} " if d.get("guess") else ""
            parts.append(f"UNAUTHORIZED {who}{d['conf']:.2f} ({d['reason']})")
    return " | ".join(parts)


def capture_loop():
    global latest_jpeg, latest_status
    cap = cv2.VideoCapture(args.camera, cv2.CAP_V4L2)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, args.width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, args.height)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    prev = time.time()
    fps = 0.0
    last_log = 0.0
    while True:
        ok, frame = cap.read()
        if not ok:
            print("Camera frame পাওয়া যায়নি, আবার চেষ্টা... (webcam লাগানো আছে কি? দেখুন: lsusb)")
            time.sleep(1)
            cap.release()
            cap = cv2.VideoCapture(args.camera, cv2.CAP_V4L2)
            continue

        detections = process(frame)

        now = time.time()
        fps = 0.9 * fps + 0.1 * (1.0 / max(now - prev, 1e-6))
        prev = now
        cv2.putText(frame, f"FPS {fps:.1f}", (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

        # terminal-এ প্রতি সেকেন্ডে একবার ফলাফল
        if now - last_log >= 1.0:
            last_log = now
            print(f"[{time.strftime('%H:%M:%S')}] FPS {fps:4.1f} | {summary(detections)}", flush=True)

        ok, jpg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
        if ok:
            with lock:
                latest_jpeg = jpg.tobytes()
                latest_status = {"version": VERSION, "fps": round(fps, 1), "detections": detections}


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


def local_ips():
    try:
        out = subprocess.run(["hostname", "-I"], capture_output=True, text=True, timeout=3).stdout
        return [ip for ip in out.split() if "." in ip]
    except Exception:
        return []


if __name__ == "__main__":
    print(f"server.py version {VERSION}")
    print("Model classes:", model.names)
    print("AUTHORIZED:", sorted(AUTHORIZED))
    if args.deny:
        print("DENIED (--deny):", sorted(set(args.deny)))
        typo = set(args.deny) - MODEL_NAMES
        if typo:
            print("সতর্কতা: --deny-এর এই নামগুলো মডেলে নেই, বানান দেখুন:", sorted(typo))
    print(f"auth-conf: {args.auth_conf}   hold: {args.hold}s   imgsz: {args.imgsz}")
    for ip in local_ips():
        print(f"মোবাইল app-এর Settings-এ দিন:  http://{ip}:{args.port}")
    threading.Thread(target=capture_loop, daemon=True).start()
    app.run(host="0.0.0.0", port=args.port, threaded=True)
