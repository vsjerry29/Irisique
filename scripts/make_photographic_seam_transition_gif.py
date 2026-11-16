import glob
import os
from PIL import Image

image_files = [
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/homepage_seam_qa/01_home_p0_hero.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/homepage_seam_qa/01_home_p20_seam_revealing.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/homepage_seam_qa/01_home_p40_mid_seam_diagonal.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/homepage_seam_qa/01_home_p60_iris_moving_to_solo.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/homepage_seam_qa/01_home_p80_stroma_crossfade.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/homepage_seam_qa/01_home_p100_gallery_settled.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/homepage_seam_qa/02_home_hover_couple.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/homepage_seam_qa/03_home_hover_family.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/homepage_seam_qa/04_home_detail_modal.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/homepage_seam_qa/05_home_products_settled.png',
]

durations = [
    950,  # p=0% Hero
    650,  # p=20% Seam entry
    650,  # p=40% Mid seam
    700,  # p=60% Iris moving to Solo
    750,  # p=80% Stroma crossfade
    1100, # p=100% Gallery settled
    1100, # Couple hover
    1100, # Family hover
    1300, # Detail modal
    1200  # Products boundary
]

frames = []
for f in image_files:
    if os.path.exists(f):
        im = Image.open(f).convert('RGB')
        im = im.resize((960, 600), Image.Resampling.LANCZOS)
        im = im.quantize(colors=128, method=Image.Resampling.LANCZOS)
        frames.append(im)
    else:
        print(f"File not found: {f}")

out_local = 'D:/Irisique/recordings/photographic_seam_transition.gif'
out_art = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings/photographic_seam_transition.gif'

os.makedirs('D:/Irisique/recordings', exist_ok=True)
os.makedirs('C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings', exist_ok=True)

if frames:
    frames[0].save(out_local, save_all=True, append_images=frames[1:], duration=durations[:len(frames)], loop=0, optimize=True)
    frames[0].save(out_art, save_all=True, append_images=frames[1:], duration=durations[:len(frames)], loop=0, optimize=True)
    sz = os.path.getsize(out_local) / 1024
    print(f'Photographic Seam Transition GIF generated successfully: {sz:.1f} KB at {out_local}')
else:
    print('No frames found!')
