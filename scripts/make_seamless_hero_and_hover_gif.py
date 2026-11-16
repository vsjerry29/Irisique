import glob
import os
from PIL import Image

image_files = [
    'D:/Irisique/screenshots/seamless_hero_qa/01_transition_p0.png',
    'D:/Irisique/screenshots/seamless_hero_qa/01_transition_p20.png',
    'D:/Irisique/screenshots/seamless_hero_qa/01_transition_p40.png',
    'D:/Irisique/screenshots/seamless_hero_qa/01_transition_p60.png',
    'D:/Irisique/screenshots/seamless_hero_qa/01_transition_p80.png',
    'D:/Irisique/screenshots/seamless_hero_qa/01_transition_p100.png',
    'D:/Irisique/screenshots/seamless_hero_qa/03_hover_state_solo.png',
    'D:/Irisique/screenshots/seamless_hero_qa/04_hover_state_couple.png',
    'D:/Irisique/screenshots/seamless_hero_qa/05_hover_state_family.png',
    'D:/Irisique/screenshots/seamless_hero_qa/06_detail_modal_opened.png',
    'D:/Irisique/screenshots/seamless_hero_qa/02_reverse_scroll_restored_hero.png',
    'D:/Irisique/screenshots/seamless_hero_qa/08_booking_section_clean.png'
]

durations = [
    900,  # p=0%
    600,  # p=20%
    600,  # p=40%
    600,  # p=60%
    750,  # p=80%
    900,  # p=100%
    1100, # Solo
    1100, # Couple
    1100, # Family
    1400, # Detail Modal
    1200, # Restored Hero
    1200  # Clean Booking
]

frames = []
for f in image_files:
    if os.path.exists(f):
        im = Image.open(f).convert('RGB')
        im = im.resize((960, 600), Image.Resampling.LANCZOS)
        im = im.quantize(colors=128, method=Image.Resampling.LANCZOS)
        frames.append(im)

out_local = 'D:/Irisique/recordings/seamless_transition_and_hover.gif'
out_art = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings/seamless_transition_and_hover.gif'

os.makedirs('D:/Irisique/recordings', exist_ok=True)
os.makedirs('C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings', exist_ok=True)

if frames:
    frames[0].save(out_local, save_all=True, append_images=frames[1:], duration=durations[:len(frames)], loop=0, optimize=True)
    frames[0].save(out_art, save_all=True, append_images=frames[1:], duration=durations[:len(frames)], loop=0, optimize=True)
    sz = os.path.getsize(out_local) / 1024
    print(f'Walkthrough GIF generated successfully: {sz:.1f} KB at {out_local}')
else:
    print('No frames found!')
