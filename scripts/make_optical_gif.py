
from PIL import Image
import glob
import os

frames = sorted(glob.glob('D:/Irisique/recordings/optical_thread_frames/frame_*.png'))
images = []
for f in frames:
    im = Image.open(f).convert('RGB')
    im = im.resize((960, 600), Image.Resampling.LANCZOS)
    # Quantize to 128 colors to keep file size under 2MB
    im = im.quantize(colors=128, method=Image.Resampling.LANCZOS)
    images.append(im)

out_path_local = 'D:/Irisique/recordings/optical_thread_walkthrough.gif'
out_path_art = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings/optical_thread_walkthrough.gif'

if images:
    images[0].save(out_path_local, save_all=True, append_images=images[1:], duration=120, loop=0, optimize=True)
    images[0].save(out_path_art, save_all=True, append_images=images[1:], duration=120, loop=0, optimize=True)
    sz = os.path.getsize(out_path_local) / 1024
    print(f'Successfully compiled GIF: {sz:.1f} KB')
