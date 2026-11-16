import os
from PIL import Image

ARTIFACT_DIR = "C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70"
SCREENSHOT_DIR = os.path.join(ARTIFACT_DIR, "screenshots", "transition_stability_verified")
OUTPUT_GIF = os.path.join(ARTIFACT_DIR, "recordings", "transition_stability_verified.gif")

os.makedirs(os.path.dirname(OUTPUT_GIF), exist_ok=True)

frame_files = [
    ("01_resting_hero_approved.png", 1800),
    ("02_pupil_dive_p58.png", 1200),
    ("03_handoff_25pct_p68.png", 900),
    ("04_handoff_50pct_p75.png", 900),
    ("05_handoff_75pct_p82.png", 900),
    ("06_gallery_settled_solo.png", 1600),
    ("07_gallery_tab_couple.png", 1600),
    ("08_gallery_tab_family.png", 1600),
    ("09_gallery_tab_solo_returned.png", 1400),
    ("10_gallery_idle_10s_stable.png", 1800),
    ("11_reverse_scroll_cycle1_hero.png", 1800),
    ("12_forward_scroll_cycle1_gallery.png", 1600),
]

images = []
durations = []

for filename, dur in frame_files:
    filepath = os.path.join(SCREENSHOT_DIR, filename)
    if os.path.exists(filepath):
        im = Image.open(filepath).convert("RGB")
        # Resize to 960x453 for optimal GIF file size and fast web preview
        im_resized = im.resize((960, int(960 * im.height / im.width)), Image.Resampling.LANCZOS)
        # Convert to palette mode with adaptive palette
        im_quant = im_resized.convert("P", palette=Image.Palette.ADAPTIVE, colors=256)
        images.append(im_quant)
        durations.append(dur)
    else:
        print(f"Warning: {filename} does not exist!")

if images:
    images[0].save(
        OUTPUT_GIF,
        save_all=True,
        append_images=images[1:],
        duration=durations,
        loop=0,
        optimize=True,
    )
    print(f"Successfully compiled {len(images)} frames to {OUTPUT_GIF}")
    print(f"File size: {os.path.getsize(OUTPUT_GIF) / (1024 * 1024):.2f} MB")
else:
    print("Error: No frames found to compile.")
