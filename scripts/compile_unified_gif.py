from PIL import Image
import glob
import os
import shutil

tempDir = "D:/Irisique/recordings/unified/frames"
pLocal = "D:/Irisique/recordings/unified/05_unified_hero_journey.gif"
pArtifact = "C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings/05_unified_hero_journey.gif"

frames = sorted(glob.glob(f"{tempDir}/frame_*.png"))
print(f"Found {len(frames)} frames.")

imgs = []
for f in frames:
    im = Image.open(f)
    im.thumbnail((960, 600), Image.Resampling.LANCZOS)
    imgs.append(im)

if imgs:
    os.makedirs(os.path.dirname(pLocal), exist_ok=True)
    os.makedirs(os.path.dirname(pArtifact), exist_ok=True)
    imgs[0].save(
        pLocal,
        save_all=True,
        append_images=imgs[1:],
        duration=180,
        loop=0,
        optimize=True
    )
    shutil.copyfile(pLocal, pArtifact)
    size = os.path.getsize(pLocal)
    print(f"Unified Journey GIF saved successfully: {size} bytes")
