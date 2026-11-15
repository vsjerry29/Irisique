import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps

BASE_DIR = r"D:\Irisique"
PUBLIC_PRODUCTS = os.path.join(BASE_DIR, "public", "assets", "products")
os.makedirs(PUBLIC_PRODUCTS, exist_ok=True)

# Sources
IRIS_AMBER_PATH = os.path.join(BASE_DIR, "public", "assets", "gallery", "iris_amber.webp")
IRIS_SAPPHIRE_PATH = os.path.join(BASE_DIR, "public", "assets", "gallery", "iris_sapphire.webp")
IRIS_EMERALD_PATH = os.path.join(BASE_DIR, "public", "assets", "gallery", "iris_emerald.webp")
COUPLE_ART_PATH = os.path.join(BASE_DIR, "public", "assets", "couple", "couple_artwork_final.webp")

amber = Image.open(IRIS_AMBER_PATH).convert("RGBA")
sapphire = Image.open(IRIS_SAPPHIRE_PATH).convert("RGBA")
emerald = Image.open(IRIS_EMERALD_PATH).convert("RGBA")
couple = Image.open(COUPLE_ART_PATH).convert("RGBA")

W, H = 1200, 800

def create_circular_mask(size):
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    return mask

def make_bg(gradient_type="center"):
    # Neutral dark luxury background (rich black to charcoal gradient)
    bg = Image.new("RGBA", (W, H), (6, 7, 9, 255))
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    if gradient_type == "center":
        # Radial soft light in center
        for r in range(400, 0, -10):
            alpha = int((1 - r / 400.0) * 22)
            draw.ellipse((W//2 - r*1.6, H//2 - r, W//2 + r*1.6, H//2 + r), fill=(25, 28, 35, alpha))
    elif gradient_type == "wall":
        # Architectural wall with subtle top light
        for y in range(H):
            fac = 1.0 - (y / H) * 0.4
            c = int(12 * fac)
            draw.line([(0, y), (W, y)], fill=(c, c+1, c+3, 255))
        # Subtle horizontal floor line
        draw.line([(0, int(H*0.75)), (W, int(H*0.75))], fill=(18, 20, 24, 255), width=2)
    elif gradient_type == "pedestal":
        # Dark studio tabletop
        for y in range(int(H*0.62), H):
            t = (y - H*0.62) / (H*0.38)
            c = int(8 + t * 14)
            draw.line([(0, y), (W, y)], fill=(c, c+1, c+3, 255))
    
    bg = Image.alpha_composite(bg, overlay)
    return bg

# 1. DIGITAL ARTWORK (product_digital.webp)
def generate_digital():
    bg = make_bg("center")
    # Minimal studio tablet / master display
    tab_w, tab_h = 760, 520
    x0, y0 = (W - tab_w)//2, (H - tab_h)//2
    
    # Shadow
    shadow = Image.new("RGBA", (W, H), (0,0,0,0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle((x0-10, y0+20, x0+tab_w+10, y0+tab_h+40), radius=28, fill=(0,0,0,180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(30))
    bg = Image.alpha_composite(bg, shadow)
    
    # Device Body (Matte Space Black)
    dev = Image.new("RGBA", (W, H), (0,0,0,0))
    d_draw = ImageDraw.Draw(dev)
    d_draw.rounded_rectangle((x0, y0, x0+tab_w, y0+tab_h), radius=24, fill=(14, 15, 18, 255), outline=(42, 45, 52, 255), width=2)
    
    # Screen bezel
    s_pad = 16
    sx0, sy0 = x0 + s_pad, y0 + s_pad
    sx1, sy1 = x0 + tab_w - s_pad, y0 + tab_h - s_pad
    d_draw.rounded_rectangle((sx0, sy0, sx1, sy1), radius=14, fill=(2, 3, 4, 255))
    
    bg = Image.alpha_composite(bg, dev)
    
    # Place Sapphire Iris on Screen
    iris_size = 380
    iris_res = sapphire.resize((iris_size, iris_size), Image.Resampling.LANCZOS)
    mask = create_circular_mask(iris_size)
    bg.paste(iris_res, (W//2 - iris_size//2, H//2 - iris_size//2), mask)
    
    # Digital UI overlay markers
    ui = Image.new("RGBA", (W, H), (0,0,0,0))
    u_draw = ImageDraw.Draw(ui)
    u_draw.text((sx0 + 24, sy0 + 20), "IRIS MASTER // P3 WIDE GAMUT 4096×4096", fill=(140, 145, 155, 200))
    u_draw.text((sx1 - 180, sy0 + 20), "DIGITAL PROOF #01", fill=(140, 145, 155, 200))
    u_draw.text((sx0 + 24, sy1 - 32), "AUTHENTICATED BIOMETRIC ATELIER ARCHIVE", fill=(110, 115, 125, 180))
    u_draw.rectangle((W//2 - 200, H//2 - 200, W//2 + 200, H//2 + 200), outline=(255, 255, 255, 30), width=1)
    
    bg = Image.alpha_composite(bg, ui)
    bg.convert("RGB").save(os.path.join(PUBLIC_PRODUCTS, "product_digital.webp"), "WEBP", quality=92)
    print("Generated product_digital.webp")

# 2. PHOTO PRINT (product_photo_print.webp)
def generate_photo_print():
    bg = make_bg("pedestal")
    pw, ph = 480, 480
    px0, py0 = (W - pw)//2, (H - ph)//2 - 20
    
    # Shadow
    shadow = Image.new("RGBA", (W, H), (0,0,0,0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rectangle((px0+10, py0+15, px0+pw+15, py0+ph+25), fill=(0,0,0,210))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    bg = Image.alpha_composite(bg, shadow)
    
    # Print Sheet (Ultra-clean white archival border)
    sheet = Image.new("RGBA", (W, H), (0,0,0,0))
    sh_draw = ImageDraw.Draw(sheet)
    sh_draw.rectangle((px0, py0, px0+pw, py0+ph), fill=(245, 245, 247, 255))
    bg = Image.alpha_composite(bg, sheet)
    
    # Center iris image inside border
    in_pad = 40
    i_size = pw - in_pad*2
    i_img = amber.resize((i_size, i_size), Image.Resampling.LANCZOS)
    bg.paste(i_img, (px0 + in_pad, py0 + in_pad))
    
    # Embossed Studio Seal at bottom right of print
    seal = Image.new("RGBA", (W, H), (0,0,0,0))
    sl_draw = ImageDraw.Draw(seal)
    sl_draw.text((px0 + pw - 130, py0 + ph - 24), "IRIS® PONDICHERRY", fill=(170, 170, 175, 220))
    bg = Image.alpha_composite(bg, seal)
    bg.convert("RGB").save(os.path.join(PUBLIC_PRODUCTS, "product_photo_print.webp"), "WEBP", quality=92)
    print("Generated product_photo_print.webp")

# 3. FINE ART PRINT (product_fine_art.webp)
def generate_fine_art():
    bg = make_bg("wall")
    fw, fh = 580, 580
    fx0, fy0 = (W - fw)//2, (H - fh)//2 - 15
    
    # Drop shadow
    shadow = Image.new("RGBA", (W, H), (0,0,0,0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rectangle((fx0+12, fy0+18, fx0+fw+12, fy0+fh+24), fill=(0,0,0,230))
    shadow = shadow.filter(ImageFilter.GaussianBlur(32))
    bg = Image.alpha_composite(bg, shadow)
    
    # Fine Art Frame (Slim White Museum Frame)
    frame = Image.new("RGBA", (W, H), (0,0,0,0))
    f_draw = ImageDraw.Draw(frame)
    f_draw.rectangle((fx0, fy0, fx0+fw, fy0+fh), fill=(240, 240, 242, 255), outline=(200, 200, 205, 255), width=2)
    # Deep Mat (Warm Ivory Passe-partout)
    m_pad = 20
    f_draw.rectangle((fx0+m_pad, fy0+m_pad, fx0+fw-m_pad, fy0+fh-m_pad), fill=(246, 245, 242, 255))
    # Bevel cut inner mat shadow
    inner_pad = 70
    ix0, iy0 = fx0 + inner_pad, fy0 + inner_pad
    ix1, iy1 = fx0 + fw - inner_pad, fy0 + fh - inner_pad
    f_draw.rectangle((ix0, iy0, ix1, iy1), fill=(4, 5, 6, 255), outline=(190, 188, 182, 255), width=1)
    bg = Image.alpha_composite(bg, frame)
    
    # Emerald Iris inside fine art frame
    iris_size = ix1 - ix0 - 20
    i_res = emerald.resize((iris_size, iris_size), Image.Resampling.LANCZOS)
    bg.paste(i_res, (ix0 + 10, iy0 + 10))
    
    bg.convert("RGB").save(os.path.join(PUBLIC_PRODUCTS, "product_fine_art.webp"), "WEBP", quality=92)
    print("Generated product_fine_art.webp")

# 4. FRAMED ARTWORK (product_framed.webp)
def generate_framed():
    bg = make_bg("wall")
    fw, fh = 620, 620
    fx0, fy0 = (W - fw)//2, (H - fh)//2 - 15
    
    # Deep shadow for box frame
    shadow = Image.new("RGBA", (W, H), (0,0,0,0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rectangle((fx0+20, fy0+25, fx0+fw+20, fy0+fh+35), fill=(0,0,0,240))
    shadow = shadow.filter(ImageFilter.GaussianBlur(36))
    bg = Image.alpha_composite(bg, shadow)
    
    # Deep Matte Black Aluminum Box Frame (40mm thickness look)
    box = Image.new("RGBA", (W, H), (0,0,0,0))
    b_draw = ImageDraw.Draw(box)
    b_draw.rectangle((fx0, fy0, fx0+fw, fy0+fh), fill=(18, 19, 22, 255), outline=(50, 52, 60, 255), width=3)
    # Inner bevel
    b_draw.rectangle((fx0+18, fy0+18, fx0+fw-18, fy0+fh-18), fill=(8, 9, 11, 255), outline=(30, 32, 38, 255), width=1)
    bg = Image.alpha_composite(bg, box)
    
    # Sapphire Master Iris inside matte black frame
    iris_size = 460
    i_res = sapphire.resize((iris_size, iris_size), Image.Resampling.LANCZOS)
    bg.paste(i_res, (W//2 - iris_size//2, H//2 - iris_size//2 - 15))
    
    # Museum glass soft reflection
    glass = Image.new("RGBA", (W, H), (0,0,0,0))
    g_draw = ImageDraw.Draw(glass)
    g_draw.polygon([(fx0+20, fy0+20), (fx0+fw-20, fy0+20), (fx0+20, fy0+fh-20)], fill=(255, 255, 255, 7))
    bg = Image.alpha_composite(bg, glass)
    
    bg.convert("RGB").save(os.path.join(PUBLIC_PRODUCTS, "product_framed.webp"), "WEBP", quality=92)
    print("Generated product_framed.webp")

# 5. ACRYLIC BLOCK (product_acrylic_block.webp)
def generate_acrylic_block():
    bg = make_bg("pedestal")
    bw, bh = 460, 460
    bx0, py0 = (W - bw)//2, (H - bh)//2 - 25
    
    # Pedestal shadow
    shadow = Image.new("RGBA", (W, H), (0,0,0,0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rectangle((bx0-10, py0+bh-10, bx0+bw+10, py0+bh+40), fill=(0,0,0,230))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    bg = Image.alpha_composite(bg, shadow)
    
    # Solid black backing with amber iris
    block_base = Image.new("RGBA", (W, H), (0,0,0,0))
    bb_draw = ImageDraw.Draw(block_base)
    bb_draw.rounded_rectangle((bx0, py0, bx0+bw, py0+bh), radius=16, fill=(3, 4, 5, 255))
    bg = Image.alpha_composite(bg, block_base)
    
    iris_size = 380
    i_res = amber.resize((iris_size, iris_size), Image.Resampling.LANCZOS)
    bg.paste(i_res, (W//2 - iris_size//2, py0 + (bh - iris_size)//2))
    
    # 30mm Optical Acrylic Layer with diamond-polished edges
    acrylic = Image.new("RGBA", (W, H), (0,0,0,0))
    a_draw = ImageDraw.Draw(acrylic)
    # Refractive thick borders
    a_draw.rounded_rectangle((bx0, py0, bx0+bw, py0+bh), radius=16, outline=(255, 255, 255, 140), width=4)
    # Top specular gleam
    a_draw.line([(bx0+16, py0+3), (bx0+bw-16, py0+3)], fill=(255, 255, 255, 220), width=3)
    # Left specular edge
    a_draw.line([(bx0+3, py0+16), (bx0+3, py0+bh-16)], fill=(255, 255, 255, 180), width=2)
    # Diagonal corner facet refractions
    for offset in range(8, 22):
        alpha = int((1 - offset/22.0) * 80)
        a_draw.rounded_rectangle((bx0+offset, py0+offset, bx0+bw-offset, py0+bh-offset), radius=12, outline=(255,255,255, alpha), width=1)
    
    bg = Image.alpha_composite(bg, acrylic)
    bg.convert("RGB").save(os.path.join(PUBLIC_PRODUCTS, "product_acrylic_block.webp"), "WEBP", quality=92)
    print("Generated product_acrylic_block.webp")

# 6. LIGHT BOX (product_light_box.webp)
def generate_light_box():
    bg = make_bg("wall")
    lw, lh = 560, 560
    lx0, ly0 = (W - lw)//2, (H - lh)//2 - 15
    
    # Ambient Light Bloom (Soft diffused glow from behind the frame)
    glow = Image.new("RGBA", (W, H), (0,0,0,0))
    g_draw = ImageDraw.Draw(glow)
    g_draw.ellipse((lx0-60, ly0-60, lx0+lw+60, ly0+lh+60), fill=(220, 160, 80, 55))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    bg = Image.alpha_composite(bg, glow)
    
    # Frame body (Ultra-slim black anodized edge)
    box = Image.new("RGBA", (W, H), (0,0,0,0))
    b_draw = ImageDraw.Draw(box)
    b_draw.rounded_rectangle((lx0, ly0, lx0+lw, ly0+lh), radius=12, fill=(4, 4, 6, 255), outline=(60, 62, 70, 255), width=3)
    bg = Image.alpha_composite(bg, box)
    
    # Backlit luminous Amber Iris
    i_size = lw - 24
    i_res = amber.resize((i_size, i_size), Image.Resampling.LANCZOS)
    enhancer = ImageEnhance.Brightness(i_res)
    i_res_bright = enhancer.enhance(1.15)
    bg.paste(i_res_bright, (lx0 + 12, ly0 + 12))
    
    # Subtle internal edge diffusion
    edge = Image.new("RGBA", (W, H), (0,0,0,0))
    e_draw = ImageDraw.Draw(edge)
    e_draw.rounded_rectangle((lx0+8, ly0+8, lx0+lw-8, ly0+lh-8), radius=10, outline=(255, 220, 160, 70), width=2)
    bg = Image.alpha_composite(bg, edge)
    
    bg.convert("RGB").save(os.path.join(PUBLIC_PRODUCTS, "product_light_box.webp"), "WEBP", quality=92)
    print("Generated product_light_box.webp")

# 7. JEWELRY / PENDANT (product_jewelry.webp)
def generate_jewelry():
    # Luxury dark velvet fabric background
    bg = Image.new("RGBA", (W, H), (5, 5, 7, 255))
    # Soft dramatic spotlight
    spot = Image.new("RGBA", (W, H), (0,0,0,0))
    s_draw = ImageDraw.Draw(spot)
    s_draw.ellipse((W//2 - 280, H//2 - 280, W//2 + 280, H//2 + 280), fill=(40, 42, 50, 60))
    spot = spot.filter(ImageFilter.GaussianBlur(50))
    bg = Image.alpha_composite(bg, spot)
    
    # Pendant dimensions
    dia = 320
    cx, cy = W//2, H//2 - 20
    
    # Cast shadow on velvet
    shadow = Image.new("RGBA", (W, H), (0,0,0,0))
    sh_draw = ImageDraw.Draw(shadow)
    sh_draw.ellipse((cx - dia//2 + 10, cy - dia//2 + 25, cx + dia//2 + 20, cy + dia//2 + 35), fill=(0,0,0,230))
    shadow = shadow.filter(ImageFilter.GaussianBlur(25))
    bg = Image.alpha_composite(bg, shadow)
    
    # Silver bail / loop at the top
    bail = Image.new("RGBA", (W, H), (0,0,0,0))
    bl_draw = ImageDraw.Draw(bail)
    bl_draw.rounded_rectangle((cx - 16, cy - dia//2 - 50, cx + 16, cy - dia//2), radius=8, fill=(210, 212, 218, 255), outline=(250, 252, 255, 255), width=2)
    bl_draw.ellipse((cx - 8, cy - dia//2 - 42, cx + 8, cy - dia//2 - 26), fill=(5, 5, 7, 255))
    bg = Image.alpha_composite(bg, bail)
    
    # Sterling Silver Outer Bezel
    bezel = Image.new("RGBA", (W, H), (0,0,0,0))
    bz_draw = ImageDraw.Draw(bezel)
    bz_draw.ellipse((cx - dia//2, cy - dia//2, cx + dia//2, cy + dia//2), fill=(185, 188, 195, 255), outline=(245, 248, 255, 255), width=3)
    # Inner rim
    rim_pad = 14
    bz_draw.ellipse((cx - dia//2 + rim_pad, cy - dia//2 + rim_pad, cx + dia//2 - rim_pad, cy + dia//2 - rim_pad), fill=(8, 9, 12, 255), outline=(130, 134, 142, 255), width=2)
    bg = Image.alpha_composite(bg, bezel)
    
    # High-precision miniature Iris Cabochon
    iris_dia = dia - rim_pad*2 - 8
    i_res = sapphire.resize((iris_dia, iris_dia), Image.Resampling.LANCZOS)
    c_mask = create_circular_mask(iris_dia)
    bg.paste(i_res, (cx - iris_dia//2, cy - iris_dia//2), c_mask)
    
    # Curved Sapphire Crystal Dome Highlight
    dome = Image.new("RGBA", (W, H), (0,0,0,0))
    dm_draw = ImageDraw.Draw(dome)
    dm_draw.ellipse((cx - iris_dia//2 + 25, cy - iris_dia//2 + 15, cx + iris_dia//4, cy - iris_dia//8), fill=(255, 255, 255, 75))
    dome = dome.filter(ImageFilter.GaussianBlur(16))
    bg = Image.alpha_composite(bg, dome)
    
    bg.convert("RGB").save(os.path.join(PUBLIC_PRODUCTS, "product_jewelry.webp"), "WEBP", quality=92)
    print("Generated product_jewelry.webp")

# 8. COUPLE ARTWORK (product_couple.webp)
def generate_couple_artwork():
    bg = make_bg("wall")
    cw, ch = 840, 460
    cx0, cy0 = (W - cw)//2, (H - ch)//2 - 20
    
    # Shadow
    shadow = Image.new("RGBA", (W, H), (0,0,0,0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rectangle((cx0+15, cy0+22, cx0+cw+15, cy0+ch+30), fill=(0,0,0,240))
    shadow = shadow.filter(ImageFilter.GaussianBlur(34))
    bg = Image.alpha_composite(bg, shadow)
    
    # Frame
    c_frame = Image.new("RGBA", (W, H), (0,0,0,0))
    cf_draw = ImageDraw.Draw(c_frame)
    cf_draw.rounded_rectangle((cx0, cy0, cx0+cw, cy0+ch), radius=10, fill=(16, 17, 20, 255), outline=(48, 50, 58, 255), width=2)
    # Inner border
    cf_draw.rectangle((cx0+12, cy0+12, cx0+cw-12, cy0+ch-12), fill=(2, 3, 4, 255))
    bg = Image.alpha_composite(bg, c_frame)
    
    # Final Couple Artwork (Dual Amber + Blue)
    c_img_w, c_img_h = cw - 24, ch - 24
    c_res = couple.resize((c_img_w, c_img_h), Image.Resampling.LANCZOS)
    bg.paste(c_res, (cx0 + 12, cy0 + 12))
    
    bg.convert("RGB").save(os.path.join(PUBLIC_PRODUCTS, "product_couple.webp"), "WEBP", quality=92)
    print("Generated product_couple.webp")

# 9. FAMILY ARTWORK (product_family.webp)
def generate_family_artwork():
    bg = make_bg("wall")
    fw, fh = 920, 460
    fx0, fy0 = (W - fw)//2, (H - fh)//2 - 20
    
    # Shadow
    shadow = Image.new("RGBA", (W, H), (0,0,0,0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rectangle((fx0+18, fy0+24, fx0+fw+18, fy0+fh+34), fill=(0,0,0,240))
    shadow = shadow.filter(ImageFilter.GaussianBlur(36))
    bg = Image.alpha_composite(bg, shadow)
    
    # Panoramic Frame
    f_frame = Image.new("RGBA", (W, H), (0,0,0,0))
    ff_draw = ImageDraw.Draw(f_frame)
    ff_draw.rounded_rectangle((fx0, fy0, fx0+fw, fy0+fh), radius=12, fill=(16, 17, 20, 255), outline=(48, 50, 58, 255), width=2)
    ff_draw.rectangle((fx0+14, fy0+14, fx0+fw-14, fy0+fh-14), fill=(3, 3, 5, 255))
    bg = Image.alpha_composite(bg, f_frame)
    
    # 3-Iris Constellation (Emerald, Amber, Sapphire)
    i_size = 260
    em_res = emerald.resize((i_size, i_size), Image.Resampling.LANCZOS)
    am_res = amber.resize((i_size + 20, i_size + 20), Image.Resampling.LANCZOS)
    sp_res = sapphire.resize((i_size, i_size), Image.Resampling.LANCZOS)
    
    mask260 = create_circular_mask(i_size)
    mask280 = create_circular_mask(i_size + 20)
    
    y_center = fy0 + fh//2
    # Left: Emerald
    bg.paste(em_res, (fx0 + 60, y_center - i_size//2), mask260)
    # Center (Anchor): Amber
    bg.paste(am_res, (W//2 - (i_size+20)//2, y_center - (i_size+20)//2), mask280)
    # Right: Sapphire
    bg.paste(sp_res, (fx0 + fw - 60 - i_size, y_center - i_size//2), mask260)
    
    bg.convert("RGB").save(os.path.join(PUBLIC_PRODUCTS, "product_family.webp"), "WEBP", quality=92)
    print("Generated product_family.webp")

def main():
    print("Generating all 9 original luxury product mockups...")
    generate_digital()
    generate_photo_print()
    generate_fine_art()
    generate_framed()
    generate_acrylic_block()
    generate_light_box()
    generate_jewelry()
    generate_couple_artwork()
    generate_family_artwork()
    print("All 9 product mockups successfully generated in public/assets/products!")

if __name__ == "__main__":
    main()
