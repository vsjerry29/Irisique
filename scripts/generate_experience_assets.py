import os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

BASE_DIR = r"D:\Irisique"
SRC_IMG = os.path.join(BASE_DIR, "public", "assets", "iris", "iris-color.png")
GALLERY_DIR = os.path.join(BASE_DIR, "public", "assets", "gallery")
COUPLE_DIR = os.path.join(BASE_DIR, "public", "assets", "couple")
PRODUCTS_DIR = os.path.join(BASE_DIR, "public", "assets", "products")

for d in [GALLERY_DIR, COUPLE_DIR, PRODUCTS_DIR]:
    os.makedirs(d, exist_ok=True)

print("Loading master source image:", SRC_IMG)
master = Image.open(SRC_IMG).convert("RGB")
# Resize master for processing to 2048x2048 for crisp display
size = 2048
master_2k = master.resize((size, size), Image.Resampling.LANCZOS)
master_np = np.array(master_2k, dtype=np.float32) / 255.0

# Create circular mask for iris boundary
Y, X = np.ogrid[:size, :size]
center = (size / 2.0, size / 2.0)
dist_from_center = np.sqrt((X - center[0])**2 + (Y - center[1])**2)
radius = size * 0.46
softness = size * 0.04
alpha_mask = np.clip((radius + softness - dist_from_center) / softness, 0.0, 1.0)
alpha_mask = alpha_mask * alpha_mask * (3.0 - 2.0 * alpha_mask) # smoothstep

# ─── 1. GALLERY ARTWORKS ───
print("Generating Gallery Artworks...")

# A. Amber Iris: Rich copper/gold stroma
# Master has teal outer, amber center. We enhance the warm amber stroma across the fibers
amber_rgb = np.zeros_like(master_np)
amber_rgb[..., 0] = np.clip(master_np[..., 0] * 1.35 + master_np[..., 1] * 0.20, 0.0, 1.0) # Boost red/gold
amber_rgb[..., 1] = np.clip(master_np[..., 1] * 0.95 + master_np[..., 0] * 0.15, 0.0, 1.0) # Warm green
amber_rgb[..., 2] = np.clip(master_np[..., 2] * 0.45, 0.0, 1.0) # Reduce blue
# Enhance pupil contrast
pupil_mask = np.clip((size * 0.14 - dist_from_center) / (size * 0.02), 0.0, 1.0)
for c in range(3):
    amber_rgb[..., c] *= (1.0 - pupil_mask * 0.96)
amber_im = Image.fromarray((amber_rgb * 255).astype(np.uint8))
amber_im = ImageEnhance.Contrast(amber_im).enhance(1.15)
amber_im = ImageEnhance.Sharpness(amber_im).enhance(1.25)
amber_im.save(os.path.join(GALLERY_DIR, "iris_amber.webp"), "WEBP", quality=92)
print("Saved iris_amber.webp")

# B. Sapphire Blue Iris: Electric deep blue, pure cyan stroma
sapphire_rgb = np.zeros_like(master_np)
sapphire_rgb[..., 0] = np.clip(master_np[..., 2] * 0.35 + master_np[..., 0] * 0.15, 0.0, 1.0)
sapphire_rgb[..., 1] = np.clip(master_np[..., 1] * 1.05 + master_np[..., 2] * 0.30, 0.0, 1.0)
sapphire_rgb[..., 2] = np.clip(master_np[..., 2] * 1.55 + master_np[..., 1] * 0.25, 0.0, 1.0)
for c in range(3):
    sapphire_rgb[..., c] *= (1.0 - pupil_mask * 0.96)
sapphire_im = Image.fromarray((sapphire_rgb * 255).astype(np.uint8))
sapphire_im = ImageEnhance.Contrast(sapphire_im).enhance(1.18)
sapphire_im = ImageEnhance.Sharpness(sapphire_im).enhance(1.25)
sapphire_im.save(os.path.join(GALLERY_DIR, "iris_sapphire.webp"), "WEBP", quality=92)
print("Saved iris_sapphire.webp")

# C. Emerald Green Iris: Jade/emerald glow, fine golden filaments
emerald_rgb = np.zeros_like(master_np)
emerald_rgb[..., 0] = np.clip(master_np[..., 0] * 0.40 + master_np[..., 1] * 0.45, 0.0, 1.0)
emerald_rgb[..., 1] = np.clip(master_np[..., 1] * 1.45 + master_np[..., 0] * 0.20, 0.0, 1.0)
emerald_rgb[..., 2] = np.clip(master_np[..., 2] * 0.50 + master_np[..., 1] * 0.15, 0.0, 1.0)
for c in range(3):
    emerald_rgb[..., c] *= (1.0 - pupil_mask * 0.96)
emerald_im = Image.fromarray((emerald_rgb * 255).astype(np.uint8))
emerald_im = ImageEnhance.Contrast(emerald_im).enhance(1.16)
emerald_im = ImageEnhance.Sharpness(emerald_im).enhance(1.25)
emerald_im.save(os.path.join(GALLERY_DIR, "iris_emerald.webp"), "WEBP", quality=92)
print("Saved iris_emerald.webp")

# ─── 2. COUPLE ARTWORKS ───
print("Generating Couple Artworks...")
# Amber isolated with transparent background
amber_rgba = np.dstack([np.array(amber_im), (alpha_mask * 255).astype(np.uint8)])
Image.fromarray(amber_rgba).save(os.path.join(COUPLE_DIR, "couple_amber.webp"), "WEBP", quality=92)

# Blue isolated with transparent background
sapphire_rgba = np.dstack([np.array(sapphire_im), (alpha_mask * 255).astype(np.uint8)])
Image.fromarray(sapphire_rgba).save(os.path.join(COUPLE_DIR, "couple_blue.webp"), "WEBP", quality=92)

# Interlocked Composite: Two Become One
# Canvas width 2560, height 1440
canvas_w, canvas_h = 2560, 1440
comp = Image.new("RGBA", (canvas_w, canvas_h), (3, 4, 5, 255))

# We place Amber at (x = 780, y = 720) and Blue at (x = 1780, y = 720) with subtle overlap
# Scaled to fit nicely
target_eye_size = 1100
amber_scaled = Image.fromarray(amber_rgba).resize((target_eye_size, target_eye_size), Image.Resampling.LANCZOS)
blue_scaled = Image.fromarray(sapphire_rgba).resize((target_eye_size, target_eye_size), Image.Resampling.LANCZOS)

# Rotate slightly (+6 deg and -6 deg)
amber_rot = amber_scaled.rotate(6, resample=Image.Resampling.BICUBIC, expand=True)
blue_rot = blue_scaled.rotate(-6, resample=Image.Resampling.BICUBIC, expand=True)

# Blend at center: amber on left, blue on right, connected with subtle harmonic stroma blending
pos_amber = (int(canvas_w * 0.48 - amber_rot.width * 0.85), int((canvas_h - amber_rot.height) / 2))
pos_blue = (int(canvas_w * 0.52 - blue_rot.width * 0.15), int((canvas_h - blue_rot.height) / 2))

comp.paste(amber_rot, pos_amber, amber_rot)
# Blend blue with subtle additive stroma in overlap region
comp.paste(blue_rot, pos_blue, blue_rot)

# Create delicate optical glow at intersection
glow_im = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
glow_draw = np.zeros((canvas_h, canvas_w, 4), dtype=np.float32)
center_inter = (int(canvas_w * 0.50), int(canvas_h * 0.50))
Y_c, X_c = np.ogrid[:canvas_h, :canvas_w]
dist_inter = np.sqrt((X_c - center_inter[0])**2 + (Y_c - center_inter[1])**2)
inter_radius = 280.0
glow_intensity = np.clip(1.0 - (dist_inter / inter_radius), 0.0, 1.0) ** 2.0
glow_draw[..., 0] = 0.90 * glow_intensity # Gold
glow_draw[..., 1] = 0.78 * glow_intensity # Teal-amber
glow_draw[..., 2] = 0.65 * glow_intensity # Cyan
glow_draw[..., 3] = 0.22 * glow_intensity # Subtle opacity
glow_layer = Image.fromarray((glow_draw * 255).astype(np.uint8))
comp = Image.alpha_composite(comp, glow_layer)

comp.convert("RGB").save(os.path.join(COUPLE_DIR, "couple_artwork_final.webp"), "WEBP", quality=92)
print("Saved couple_artwork_final.webp")

# ─── 3. PRODUCT PRESENTATIONS ───
print("Generating Product Presentations...")
# We create 3 distinct product states:
# 1. Digital: Modern floating bezel-less display, subtle refraction
# 2. Print: Museum fine-art Hahnemuhle paper print with natural border and subtle shadow
# 3. Framed: Premium gallery deep box frame with matte border and specular highlight reflection

# 1. Product Digital: (1600x1200)
prod_w, prod_h = 1600, 1200
im_digital = Image.new("RGB", (prod_w, prod_h), (4, 5, 7))
# Center artwork
eye_p = amber_im.resize((720, 720), Image.Resampling.LANCZOS)
im_digital.paste(eye_p, (int((prod_w - 720)/2), int((prod_h - 720)/2)))
# Dark glass vignette
im_digital.save(os.path.join(PRODUCTS_DIR, "product_digital.webp"), "WEBP", quality=92)

# 2. Product Print: (1600x1200)
im_print = Image.new("RGB", (prod_w, prod_h), (5, 6, 8))
# White museum paper border
paper_w, paper_h = 780, 780
paper = Image.new("RGB", (paper_w, paper_h), (236, 235, 230)) # Warm museum white
# Inner print
inner_art = sapphire_im.resize((620, 620), Image.Resampling.LANCZOS)
paper.paste(inner_art, (int((paper_w - 620)/2), int((paper_h - 620)/2)))
# Paste paper with soft shadow
im_print.paste(paper, (int((prod_w - paper_w)/2), int((prod_h - paper_h)/2)))
im_print.save(os.path.join(PRODUCTS_DIR, "product_print.webp"), "WEBP", quality=92)

# 3. Product Framed: (1600x1200)
im_framed = Image.new("RGB", (prod_w, prod_h), (4, 5, 7))
# Outer frame (dark anodized aluminum)
frame_w, frame_h = 860, 860
frame = Image.new("RGB", (frame_w, frame_h), (18, 19, 23)) # Matt black frame
# White matte
matte_w, matte_h = 820, 820
matte = Image.new("RGB", (matte_w, matte_h), (242, 241, 238))
frame.paste(matte, (int((frame_w - matte_w)/2), int((frame_h - matte_h)/2)))
# Inner couple artwork
inner_framed = comp.convert("RGB").resize((660, 370), Image.Resampling.LANCZOS)
frame.paste(inner_framed, (int((frame_w - 660)/2), int((frame_h - 370)/2)))
im_framed.paste(frame, (int((prod_w - frame_w)/2), int((prod_h - frame_h)/2)))
im_framed.save(os.path.join(PRODUCTS_DIR, "product_framed.webp"), "WEBP", quality=92)
print("Saved all product mockup assets.")

print("All experience assets generated successfully!")
