from PIL import Image
import os

base = "D:/Irisique/public/assets/iris"

# Convert the better macro image to PNG for the project
macro = Image.open(os.path.join(base, "iris-macro-alt.jpg"))
print(f"Macro source: {macro.size} {macro.mode}")

# Save as PNG at full resolution
macro.save(os.path.join(base, "iris-macro.png"), "PNG")
print(f"Saved iris-macro.png")

# Also create a webp version for web delivery  
macro.save(os.path.join(base, "iris-macro.webp"), "WEBP", quality=90)
print(f"Saved iris-macro.webp")

# Now create a proper iris-detail from the iris-color
# The detail texture should be the same iris image but with enhanced local contrast
# for use during the intro zoom (acts as the "sharp at macro" version)
color = Image.open(os.path.join(base, "iris-color.png"))
print(f"Color source: {color.size} {color.mode}")

# For the detail map: we want to enhance the existing iris-color to bring out fibre detail
# Use unsharp masking at high radius for local contrast enhancement
from PIL import ImageFilter, ImageEnhance

# Strong local contrast enhancement
detail = color.copy()
# Increase contrast
enhancer = ImageEnhance.Contrast(detail)
detail = enhancer.enhance(1.3)
# Increase sharpness
enhancer = ImageEnhance.Sharpness(detail)
detail = enhancer.enhance(1.5)
# Slight color saturation boost
enhancer = ImageEnhance.Color(detail)
detail = enhancer.enhance(1.15)

# Save as the new detail texture (replacing rainbow one)
detail.save(os.path.join(base, "iris-detail-new.png"), "PNG")
detail_resized = detail.resize((2048, 2048), Image.LANCZOS)
detail_resized.save(os.path.join(base, "iris-detail.webp"), "WEBP", quality=92)
print(f"Saved new iris-detail.webp (2048x2048)")

# Verify all output files
for f in ["iris-macro.png", "iris-macro.webp", "iris-detail.webp"]:
    path = os.path.join(base, f)
    img = Image.open(path)
    size_kb = os.path.getsize(path) // 1024
    print(f"  {f}: {img.size[0]}x{img.size[1]} {img.mode} ({size_kb}KB)")

print("Done!")
