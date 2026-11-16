import os
from PIL import Image

image_files = [
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/01_resting_hero_approved.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/02_iris_rotating_clockwise.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/03_stroma_depth_immersion.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/04_camera_entering_pupil.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/05_photographic_grain_development.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/06_gallery_settled_solo_stage.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/07_refractive_reveal_to_couple_mid.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/08_couple_settled_16x9_stage.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/09a_refractive_reveal_to_family_mid.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/09b_family_settled_16x9_stage.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/10_artwork_detail_modal.png',
    'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/cinematic_transition_rebuild/11_reverse_scroll_restored_hero.png',
]

durations = [
    1500, # 01: Resting hero with LOOK CLOSER.
    750,  # 02: Clockwise scroll rotation
    800,  # 03: 3D Stroma immersion
    800,  # 04: Darkroom pupil entrance
    1100, # 05: Photographic grain development
    1400, # 06: Settled solo 16:9 stage
    700,  # 07: Refractive reveal to couple mid-wavefront
    1400, # 08: Settled couple 16:9 stage
    700,  # 09a: Refractive reveal to family mid-wavefront
    1400, # 09b: Settled family 16:9 stage
    1300, # 10: Fullscreen detail modal
    1500, # 11: Reverse scroll restored hero
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

out_local = 'D:/Irisique/recordings/photographic_development_and_refractive_reveal.gif'
out_art = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings/photographic_development_and_refractive_reveal.gif'

os.makedirs('D:/Irisique/recordings', exist_ok=True)
os.makedirs('C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings', exist_ok=True)

if frames:
    frames[0].save(out_local, save_all=True, append_images=frames[1:], duration=durations[:len(frames)], loop=0, optimize=True)
    frames[0].save(out_art, save_all=True, append_images=frames[1:], duration=durations[:len(frames)], loop=0, optimize=True)
    sz = os.path.getsize(out_local) / 1024
    print(f'GIF generated successfully: {sz:.1f} KB at {out_local}')
