import os
import glob
from PIL import Image

def make_gif():
    shot_dir = r"C:\Users\SuriyaVS\.gemini\antigravity\brain\58b64365-08e0-4343-af70-8254ddcc9d70\screenshots\fixed_hero_and_gallery"
    out_path = r"C:\Users\SuriyaVS\.gemini\antigravity\brain\58b64365-08e0-4343-af70-8254ddcc9d70\recordings\hero_text_and_gallery_overlap_fix.gif"
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    
    files = [
        os.path.join(shot_dir, "01_hero_at_600ms.png"),
        os.path.join(shot_dir, "02_hero_settled.png"),
        os.path.join(shot_dir, "03_gallery_solo.png"),
        os.path.join(shot_dir, "04_gallery_couple_full.png"),
        os.path.join(shot_dir, "05_scroll_1850_dwell.png"),
        os.path.join(shot_dir, "06_scroll_2350_collection_entry.png"),
        os.path.join(shot_dir, "07_scroll_2800_collection_settled.png"),
    ]
    
    images = []
    durations = [1400, 1600, 1400, 1800, 1200, 1200, 1400]
    
    for f in files:
        if os.path.exists(f):
            im = Image.open(f)
            # Resize to 960x600 for high quality & reasonable file size
            im_resized = im.resize((960, 600), Image.Resampling.LANCZOS)
            images.append(im_resized.convert("P", palette=Image.Palette.ADAPTIVE))
            
    if images:
        images[0].save(
            out_path,
            save_all=True,
            append_images=images[1:],
            duration=durations[:len(images)],
            loop=0,
            optimize=True
        )
        print("GIF created successfully at:", out_path)

if __name__ == "__main__":
    make_gif()
