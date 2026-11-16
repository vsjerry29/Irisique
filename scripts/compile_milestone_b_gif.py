
from PIL import Image
import glob
import os
import shutil

tempDir = "D:/Irisique/recordings/milestone_b_frames"
pLocal = "D:/Irisique/recordings/milestone_b_gallery_handoff.gif"
pArtifact = "C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings/milestone_b_gallery_handoff.gif"

frames = sorted(glob.glob(f"{tempDir}/frame_*.png"))
print(f"Found {len(frames)} frames for Milestone B GIF.")

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
        duration=350,
        loop=0,
        optimize=True
    )
    shutil.copyfile(pLocal, pArtifact)
    size = os.path.getsize(pLocal)
    print(f"Milestone B GIF saved: {size} bytes at {pLocal}")
