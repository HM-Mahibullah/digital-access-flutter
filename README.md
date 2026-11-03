# digitalaccess

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.


# Rasp

update

sudo apt update && sudo apt full-upgrade -y
sudo apt install -y python3-venv python3-pip v4l-utils libgl1

## web cam check

v4l2-ctl --list-devices




### ২️⃣ অর্ধেক download হওয়া ফাইল মুছুন (জায়গা খালি করতে)
```bash
uv cache clean
```

### ৩️⃣ CPU-only PyTorch install করুন
```bash
uv pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### ৪️⃣ এবার ultralytics আর flask install করুন
```bash
uv pip install ultralytics flask
```
torch আগেই install হয়ে গেছে, তাই এবার আর NVIDIA package নামাবে না।

### ৫️⃣ পরীক্ষা করুন
```bash
python -c "import torch, ultralytics, flask, cv2; print('OK', ultralytics.__version__, torch.__version__)"
```


### ৬️⃣ SD card-এ কতটা জায়গা আছে দেখুন
```bash
df -h /
```


ncnn export

yolo export model=best.pt format=ncnn imgsz=416
yolo export model=yolo26n.pt format=ncnn imgsz=416


source .venv/bin/activate


# server run

python server.py --model best_ncnn_model --person-model yolo26n_ncnn_model --camera 0 --imgsz 640

# run 

python mock_server.py --camera 0 --interval 3
