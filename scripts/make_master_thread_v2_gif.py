
from PIL import Image
import glob
import os

frames = sorted(glob.glob('D:/Irisique/recordings/thread_v2_frames/frame_*_scroll_*.png'))
if not frames:
    frames = sorted(glob.glob('D:/Irisique/recordings/thread_v2_frames/frame_*.png'))

images = []
for f in frames[::1]: # take all frames
    im = Image.open(f).convert('RGB')
    im = im.resize((960, 600), Image.Resampling.LANCZOS)
    im = im.quantize(colors=128, method=Image.Resampling.LANCZOS)
    images.append(im)

out_local = 'D:/Irisique/recordings/optical_thread_v2_full_walkthrough.gif'
out_art = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings/optical_thread_v2_full_walkthrough.gif'

if images:
    images[0].save(out_local, save_all=True, append_images=images[1:], duration=120, loop=0, optimize=True)
    images[0].save(out_art, save_all=True, append_images=images[1:], duration=120, loop=0, optimize=True)
    sz = os.path.getsize(out_local) / 1024
    print(f'Master GIF generated successfully: {sz:.1f} KB')
