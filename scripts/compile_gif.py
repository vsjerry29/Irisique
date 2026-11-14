from PIL import Image
import glob
import os
import shutil

tempDir = "D:/Irisique/recordings/qa/frames"
pLocal = "D:/Irisique/recordings/qa/04_full_homepage_qa_scroll.gif"
pArtifact = "C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings/04_full_homepage_qa_scroll.gif"

frames = sorted(glob.glob(f"{tempDir}/frame_*.png"))
print(f"Found {len(frames)} frames.")

imgs = []
for f in frames:
    im = Image.open(f)
    im.thumbnail((800, 500), Image.Resampling.LANCZOS)
    imgs.append(im)

if imgs:
    os.makedirs(os.path.dirname(pLocal), exist_ok=True)
    os.makedirs(os.path.dirname(pArtifact), exist_ok=True)
    imgs[0].save(
        pLocal,
        save_all=True,
        append_images=imgs[1:],
        duration=200,
        loop=0,
        optimize=True
    )
    shutil.copyfile(pLocal, pArtifact)
    size = os.path.getsize(pLocal)
    print(f"GIF saved successfully: {size} bytes")
