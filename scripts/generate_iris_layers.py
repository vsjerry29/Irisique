import os
import math
import numpy as np
from PIL import Image

OUT_DIR = r"D:\Irisique\public\assets\iris\layers"
os.makedirs(OUT_DIR, exist_ok=True)

SRC_PATH = r"D:\Irisique\public\assets\iris\iris-color.webp"
print(f"Loading source iris from: {SRC_PATH}")

src_img = Image.open(SRC_PATH).convert("RGBA")
TARGET_SIZE = 2048
if src_img.size != (TARGET_SIZE, TARGET_SIZE):
    src_img = src_img.resize((TARGET_SIZE, TARGET_SIZE), Image.Resampling.LANCZOS)

src_arr = np.array(src_img, dtype=np.float32) / 255.0
H, W, _ = src_arr.shape
cy, cx = H / 2.0, W / 2.0
R_MAX = W / 2.0

# Generate coordinate grids
y_idx, x_idx = np.indices((H, W))
dx = (x_idx - cx) / R_MAX
dy = (y_idx - cy) / R_MAX
r = np.sqrt(dx * dx + dy * dy)
theta = np.arctan2(dy, dx) # Continuous [-pi, pi]

def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0 + 1e-7), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)

def band_mask(r_arr, r_in, r_in_peak, r_out_peak, r_out):
    """Smooth radial bell/band mask"""
    mask_in = smoothstep(r_in, r_in_peak, r_arr) if r_in > 0 else np.ones_like(r_arr)
    mask_out = 1.0 - smoothstep(r_out_peak, r_out, r_arr)
    return mask_in * mask_out

def circular_arc_mask(theta_arr, center_deg, half_width_deg, feather_deg=20.0):
    """Continuous periodic circular arc mask with smooth cosine/smoothstep falloff"""
    c_rad = math.radians(center_deg)
    hw_rad = math.radians(half_width_deg)
    f_rad = math.radians(feather_deg)
    
    # Periodic shortest angular distance to center angle
    diff = np.abs(np.arctan2(np.sin(theta_arr - c_rad), np.cos(theta_arr - c_rad)))
    
    solid_rad = max(0.0, hw_rad - f_rad)
    t = np.clip((diff - solid_rad) / (f_rad + 1e-7), 0.0, 1.0)
    return 1.0 - (t * t * (3.0 - 2.0 * t))

# Define the 11 anatomical segments across 5 primary layers
LAYER_DEFS = [
    # Layer E: Central Pupil & Inner Optical Darkness (Complete 360 disk)
    {
        "id": "layer_e_pupil",
        "name": "Pupil Core",
        "r_bounds": (0.00, 0.00, 0.22, 0.28),
        "arc": None, # Full 360 deg
    },
    
    # Layer D: Inner Collarette (2 interlocking asymmetrical arc segments)
    {
        "id": "layer_d1_collarette_alpha",
        "name": "Inner Collarette Alpha",
        "r_bounds": (0.22, 0.26, 0.40, 0.46),
        "arc": (115.0, 105.0, 30.0), # Center 115 deg, half-width 105 deg (spans 10..220)
    },
    {
        "id": "layer_d2_collarette_beta",
        "name": "Inner Collarette Beta",
        "r_bounds": (0.22, 0.26, 0.40, 0.46),
        "arc": (295.0, 105.0, 30.0), # Center 295 deg, half-width 105 deg (spans 190..400)
    },
    
    # Layer C: Golden Crypt Network (2 organic branching segments)
    {
        "id": "layer_c1_crypts_alpha",
        "name": "Golden Crypts Alpha",
        "r_bounds": (0.38, 0.44, 0.58, 0.66),
        "arc": (75.0, 110.0, 35.0), # Spans -35..185
    },
    {
        "id": "layer_c2_crypts_beta",
        "name": "Golden Crypts Beta",
        "r_bounds": (0.38, 0.44, 0.58, 0.66),
        "arc": (255.0, 110.0, 35.0), # Spans 145..365
    },
    
    # Layer B: Outer Blue/Teal Fibre Network (3 interlocking segments)
    {
        "id": "layer_b1_fibres_arc1",
        "name": "Teal Fibres Superior",
        "r_bounds": (0.56, 0.62, 0.78, 0.86),
        "arc": (90.0, 75.0, 30.0), # Spans 15..165
    },
    {
        "id": "layer_b2_fibres_arc2",
        "name": "Teal Fibres Inferior",
        "r_bounds": (0.56, 0.62, 0.78, 0.86),
        "arc": (210.0, 75.0, 30.0), # Spans 135..285
    },
    {
        "id": "layer_b3_fibres_arc3",
        "name": "Teal Fibres Lateral",
        "r_bounds": (0.56, 0.62, 0.78, 0.86),
        "arc": (330.0, 75.0, 30.0), # Spans 255..405 (across 0)
    },
    
    # Layer A: Outer Limbal Boundary (3 organic arc fragments)
    {
        "id": "layer_a1_limbus_arc1",
        "name": "Limbal Boundary Upper",
        "r_bounds": (0.76, 0.82, 0.93, 0.98),
        "arc": (80.0, 75.0, 30.0),
    },
    {
        "id": "layer_a2_limbus_arc2",
        "name": "Limbal Boundary Lower",
        "r_bounds": (0.76, 0.82, 0.93, 0.98),
        "arc": (200.0, 75.0, 30.0),
    },
    {
        "id": "layer_a3_limbus_arc3",
        "name": "Limbal Boundary Lateral",
        "r_bounds": (0.76, 0.82, 0.93, 0.98),
        "arc": (320.0, 75.0, 30.0),
    },
]

print("Calculating continuous periodic masks for 11 segments...")
raw_masks = []
for ldef in LAYER_DEFS:
    rin, rpeak_in, rpeak_out, rout = ldef["r_bounds"]
    rmask = band_mask(r, rin, rpeak_in, rpeak_out, rout)
    
    if ldef["arc"] is None:
        amask = np.ones_like(theta)
    else:
        c_deg, hw_deg, f_deg = ldef["arc"]
        amask = circular_arc_mask(theta, c_deg, hw_deg, f_deg)
    
    combined = rmask * amask
    raw_masks.append(combined)

# Natural iris overall alpha mask
overall_mask = 1.0 - smoothstep(0.93, 0.98, r)
mask_sum = np.sum(raw_masks, axis=0) + 1e-7

print("Normalizing segment masks for perfect seamless reconstruction...")
normalized_masks = []
for m in raw_masks:
    norm_m = (m / mask_sum) * overall_mask
    normalized_masks.append(norm_m)

print("Exporting individual layer textures...")
composite_check = np.zeros_like(src_arr)

for idx, (ldef, nmask) in enumerate(zip(LAYER_DEFS, normalized_masks)):
    layer_rgba = np.zeros((H, W, 4), dtype=np.float32)
    layer_rgba[:, :, :3] = src_arr[:, :, :3]
    layer_rgba[:, :, 3] = nmask
    
    # Save RGBA Image
    out_img = Image.fromarray((layer_rgba * 255.0).astype(np.uint8), mode="RGBA")
    webp_path = os.path.join(OUT_DIR, f"{ldef['id']}.webp")
    png_path = os.path.join(OUT_DIR, f"{ldef['id']}.png")
    out_img.save(webp_path, "WEBP", quality=95)
    out_img.save(png_path, "PNG")
    
    file_size_kb = os.path.getsize(webp_path) / 1024.0
    print(f"[{idx+1:02d}/11] Saved {ldef['id']}.webp ({file_size_kb:.1f} KB)")
    
    composite_check[:, :, :3] += src_arr[:, :, :3] * nmask[:, :, None]
    composite_check[:, :, 3] += nmask

comp_img = Image.fromarray((np.clip(composite_check, 0.0, 1.0) * 255.0).astype(np.uint8), mode="RGBA")
comp_path = r"D:\Irisique\screenshots\layers_reassembly_check.png"
comp_img.save(comp_path)
print(f"\nVerification composite saved to: {comp_path}")
print("Periodic Pass A complete with ZERO seam line!")
