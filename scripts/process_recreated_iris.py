import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, sobel

src_path = r'C:\Users\SuriyaVS\.gemini\antigravity\brain\58b64365-08e0-4343-af70-8254ddcc9d70\recreated_iris_macro_1794595913614.jpg'
out_dir = r'D:\Irisique\public\assets\iris'
os.makedirs(out_dir, exist_ok=True)

print('Loading source recreated image...')
src_img = Image.open(src_path).convert('RGB')
w_src, h_src = src_img.size

# Upscale to 4096 x 4096 using Lanczos
print('Upscaling to 4096x4096...')
master_img = src_img.resize((4096, 4096), Image.Resampling.LANCZOS)
master_arr = np.array(master_img, dtype=np.float32)

# Multi-scale micro-fiber sharpening
gray = 0.299 * master_arr[:,:,0] + 0.587 * master_arr[:,:,1] + 0.114 * master_arr[:,:,2]
blur_fine = gaussian_filter(gray, sigma=1.2)
blur_med = gaussian_filter(gray, sigma=3.0)
detail_fine = gray - blur_fine
detail_med = blur_fine - blur_med

for c in range(3):
    master_arr[:,:,c] += detail_fine * 1.4 + detail_med * 0.4

# Geometry coordinates
cx, cy = 4096 * (509.62 / 1024.0), 4096 * (495.50 / 1024.0)
y_coords, x_coords = np.ogrid[:4096, :4096]
dist_from_center = np.sqrt((x_coords - cx)**2 + (y_coords - cy)**2)
dx = x_coords - cx
dy = y_coords - cy
eps = 1e-6
rad_x = dx / (dist_from_center + eps)
rad_y = dy / (dist_from_center + eps)

r_pupil_inner = 4096 * (134.0 / 1024.0)
r_pupil_outer = 4096 * (142.0 / 1024.0)
pupil_factor = np.clip((dist_from_center - r_pupil_inner) / (r_pupil_outer - r_pupil_inner), 0.0, 1.0)

r_limbus_inner = 4096 * (440.0 / 1024.0)
r_limbus_outer = 4096 * (475.0 / 1024.0)
limbus_factor = 1.0 - np.clip((dist_from_center - r_limbus_inner) / (r_limbus_outer - r_limbus_inner), 0.0, 1.0)
limbus_factor = 0.5 - 0.5 * np.cos(limbus_factor * np.pi)

iris_visibility = pupil_factor * limbus_factor

# Clean background #030304
bg_color = np.array([3.0, 3.0, 4.0], dtype=np.float32)
for c in range(3):
    master_arr[:,:,c] = master_arr[:,:,c] * iris_visibility + bg_color[c] * (1.0 - iris_visibility)

master_arr = np.clip(master_arr, 0.0, 255.0).astype(np.uint8)
master_img_final = Image.fromarray(master_arr)

print('Saving iris-master.png...')
master_img_final.save(os.path.join(out_dir, 'iris-master.png'))

print('Saving iris-color.png and webp...')
master_img_final.save(os.path.join(out_dir, 'iris-color.png'))
master_img_final.save(os.path.join(out_dir, 'iris-color.webp'), 'WEBP', quality=95)

# Mobile version 2048x2048
mobile_img = master_img_final.resize((2048, 2048), Image.Resampling.LANCZOS)
mobile_img.save(os.path.join(out_dir, 'iris-mobile.png'))
mobile_img.save(os.path.join(out_dir, 'iris-mobile.webp'), 'WEBP', quality=92)

# -------------------------------------------------------------
# Mask Generation
# -------------------------------------------------------------
print('Generating masks...')
pupil_mask = 1.0 - np.clip((dist_from_center - r_pupil_inner) / (r_pupil_outer - r_pupil_inner), 0.0, 1.0)
iris_tissue_mask = pupil_factor * limbus_factor

# Crypt zone: r between 140 and 380 in 1024 scale (560 to 1520 in 4096 scale)
r_crypt_center = 4096 * (250.0 / 1024.0)
crypt_zone_mask = np.exp(-((dist_from_center - r_crypt_center) / (4096 * 0.12))**2) * iris_tissue_mask

mask_rgba = np.zeros((4096, 4096, 4), dtype=np.uint8)
mask_rgba[:,:,0] = np.clip(pupil_mask * 255.0, 0, 255).astype(np.uint8)
mask_rgba[:,:,1] = np.clip(iris_tissue_mask * 255.0, 0, 255).astype(np.uint8)
mask_rgba[:,:,2] = np.clip(crypt_zone_mask * 255.0, 0, 255).astype(np.uint8)
mask_rgba[:,:,3] = np.clip(limbus_factor * 255.0, 0, 255).astype(np.uint8)

mask_img = Image.fromarray(mask_rgba)
mask_img.save(os.path.join(out_dir, 'iris-mask.png'))
mask_img.resize((2048, 2048), Image.Resampling.LANCZOS).save(os.path.join(out_dir, 'iris-mask.webp'), 'WEBP', quality=95)

# -------------------------------------------------------------
# Anatomical Height Map
# -------------------------------------------------------------
print('Generating anatomical height map...')
# Base anatomical slope:
# Pupillary ruff lip near pupil
ruff = np.exp(-((dist_from_center - (r_pupil_outer + 4096 * 0.008)) / (4096 * 0.012))**2) * 0.4
# Trabecular arch elevation in mid-zone
arch_elev = np.exp(-((dist_from_center - r_crypt_center) / (4096 * 0.08))**2) * 0.6
# Ciliary slope to limbus
ciliary_slope = np.clip(1.0 - (dist_from_center - r_crypt_center) / (r_limbus_inner - r_crypt_center + eps), 0.0, 1.0) * 0.35
base_macro_height = (ruff + arch_elev + ciliary_slope) * iris_tissue_mask

# Structural micro-relief from luminance (crypts are dark hollows, ridges are raised)
lum_norm = (gray - gray.min()) / (gray.max() - gray.min() + eps)
fine_fibers = gray - gaussian_filter(gray, sigma=2.5)
fine_fibers_norm = np.clip(fine_fibers / (np.std(fine_fibers) * 3.0 + eps), -1.0, 1.0) * 0.28

height_total = np.clip(base_macro_height * (0.5 + 0.5 * lum_norm) + fine_fibers_norm * iris_tissue_mask, 0.0, 1.0)
height_uint8 = (height_total * 255.0).astype(np.uint8)

height_img = Image.fromarray(height_uint8, mode='L')
height_img.save(os.path.join(out_dir, 'iris-height.png'))
height_img.resize((2048, 2048), Image.Resampling.LANCZOS).save(os.path.join(out_dir, 'iris-height.webp'), 'WEBP', quality=95)

# -------------------------------------------------------------
# Detail Map: Flow Tangent Vector Field + Micro Relief + Specular
# -------------------------------------------------------------
print('Generating detail vector field and micro-relief...')
gx = sobel(gaussian_filter(gray, sigma=2.5), axis=1)
gy = sobel(gaussian_filter(gray, sigma=2.5), axis=0)
g_mag = np.sqrt(gx**2 + gy**2) + eps

tang_x = -gy / g_mag
tang_y = gx / g_mag
dot_rad = tang_x * rad_x + tang_y * rad_y
tang_x = np.where(dot_rad < 0, -tang_x, tang_x)
tang_y = np.where(dot_rad < 0, -tang_y, tang_y)

# 75% local filament tangent, 25% radial
flow_x = 0.75 * tang_x + 0.25 * rad_x
flow_y = 0.75 * tang_y + 0.25 * rad_y
flow_len = np.sqrt(flow_x**2 + flow_y**2) + eps
flow_x /= flow_len
flow_y /= flow_len

flow_r = np.clip((flow_x * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
flow_g = np.clip((flow_y * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
ridge_b = np.clip((fine_fibers_norm * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
spec_a = np.clip((height_total**1.4) * 255.0, 0, 255).astype(np.uint8)

detail_rgba = np.stack([flow_r, flow_g, ridge_b, spec_a], axis=2)
detail_img = Image.fromarray(detail_rgba)
detail_img.save(os.path.join(out_dir, 'iris-detail.png'))
detail_img.resize((2048, 2048), Image.Resampling.LANCZOS).save(os.path.join(out_dir, 'iris-detail.webp'), 'WEBP', quality=95)

print('All recreated assets processed and saved successfully!')
