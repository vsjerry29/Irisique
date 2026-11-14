from PIL import Image
import os

base = "D:/Irisique/public/assets/iris"
files = [
    "iris-color.webp", "iris-color.png", "iris-detail.webp", "iris-detail.png",
    "iris-height.webp", "iris-mask.webp", "iris-mobile.webp", "iris-master.png"
]

for f in files:
    path = os.path.join(base, f)
    if os.path.exists(path):
        img = Image.open(path)
        size_kb = os.path.getsize(path) // 1024
        print(f"{f}: {img.size[0]}x{img.size[1]} {img.mode} ({size_kb}KB)")
    else:
        print(f"{f}: NOT FOUND")
