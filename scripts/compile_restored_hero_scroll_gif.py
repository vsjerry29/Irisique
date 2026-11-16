import os
from PIL import Image

image_files = [
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/two_part_hero_scroll_qa/01_resting_hero_1770x830.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/two_part_hero_scroll_qa/01_resting_hero_1440x900.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/two_part_hero_scroll_qa/02_rotation_p10_deg35.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/two_part_hero_scroll_qa/03_rotation_p20_deg70.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/two_part_hero_scroll_qa/04_rotation_p35_deg125.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/two_part_hero_scroll_qa/05_immersion_p50_layers.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/two_part_hero_scroll_qa/06_immersion_p65_consolidating.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/two_part_hero_scroll_qa/07_transition_p80_seam.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/two_part_hero_scroll_qa/08_gallery_p100_settled.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/two_part_hero_scroll_qa/09_reverse_scroll_restored_hero.png',
]

durations = [
    1400, # 1770x830 resting hero
    1400, # 1440x900 resting hero
    650,  # p=0.10 rotation
    650,  # p=0.20 rotation
    800,  # p=0.35 rotation arc complete
    850,  # p=0.50 stroma layers
    850,  # p=0.65 consolidating
    950,  # p=0.80 photographic seam
    1300, # p=1.00 gallery settled
    1400, # reverse scroll back to resting hero
]

frames = []
for f in image_files:
    if os.path.exists(f):
        im = Image.open(f).convert('RGB')
        im = im.resize((960, 540), Image.Resampling.LANCZOS)
        im = im.quantize(colors=128, method=Image.Resampling.LANCZOS)
        frames.append(im)
    else:
        print(f"File not found: {f}")

out_local = 'D:/Irisique/recordings/restored_exact_hero_scroll_sequence.gif'
out_art = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings/restored_exact_hero_scroll_sequence.gif'

os.makedirs('D:/Irisique/recordings', exist_ok=True)
os.makedirs('C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings', exist_ok=True)

if frames:
    frames[0].save(out_local, save_all=True, append_images=frames[1:], duration=durations[:len(frames)], loop=0, optimize=True)
    frames[0].save(out_art, save_all=True, append_images=frames[1:], duration=durations[:len(frames)], loop=0, optimize=True)
    sz = os.path.getsize(out_local) / 1024
    print(f'GIF generated successfully: {sz:.1f} KB at {out_local}')
else:
    print('No frames found!')
