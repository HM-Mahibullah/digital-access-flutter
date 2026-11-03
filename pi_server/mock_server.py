"""
App-এর UI পরীক্ষা করার জন্য: প্রতি কয়েক সেকেন্ডে random নাম পাঠায়
(Amit, Sifat -> AUTHORIZED, Mahibullah -> UNAUTHORIZED)।

চালানো:
  python mock_server.py --camera 0 --interval 3
"""
import argparse
import random
import threading
import time

import cv2
import numpy as np
from flask import Flask, Response, jsonify

TEST_CASES = [
    ("Amit", "authorized"),
    ("Sifat", "authorized"),
    ("Mahibullah", "unauthorized"),
]

parser = argparse.ArgumentParser()
parser.add_argument("--camera", type=int, default=0)
parser.add_argument("--interval", type=float, default=3.0, help="কত সেকেন্ড পরপর নাম বদলাবে")
parser.add_argument("--port", type=int, default=5000)
args = parser.parse_args()

app = Flask(__name__)
lock = threading.Lock()
latest_jpeg = None
latest_status = {"simulated": True, "fps": 0.0, "detections": []}


def capture_loop():
    global latest_jpeg, latest_status
    cap = cv2.VideoCapture(args.camera, cv2.CAP_V4L2)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    current = random.choice(TEST_CASES)
    conf = round(random.uniform(0.70, 0.95), 2)
    changed = time.time()
    prev, fps = time.time(), 0.0

    while True:
        ok, frame = cap.read()
        if not ok:
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            time.sleep(0.1)

        if time.time() - changed >= args.interval:
            current = random.choice(TEST_CASES)
            conf = round(random.uniform(0.70, 0.95), 2)
            changed = time.time()

        name, status = current
        h, w = frame.shape[:2]
        color = (0, 200, 0) if status == "authorized" else (0, 0, 255)
        label = f"{status.upper()}: {name} {conf:.2f}"
        x1, y1, x2, y2 = w // 4, h // 6, 3 * w // 4, 5 * h // 6
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.rectangle(frame, (x1, y1 - 26), (x1 + 12 * len(label), y1), color, -1)
        cv2.putText(frame, label, (x1 + 4, y1 - 7), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        now = time.time()
        fps = 0.9 * fps + 0.1 * (1.0 / max(now - prev, 1e-6))
        prev = now

        ok, jpg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
        if ok:
            det = {"name": name if status == "authorized" else None, "status": status, "conf": conf}
            with lock:
                latest_jpeg = jpg.tobytes()
                latest_status = {"simulated": True, "fps": round(fps, 1), "detections": [det]}


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
    return '<img src="/video_feed" style="max-width:100%">'


if __name__ == "__main__":
    print("*** Mock server running ***")
    threading.Thread(target=capture_loop, daemon=True).start()
    app.run(host="0.0.0.0", port=args.port, threaded=True)
