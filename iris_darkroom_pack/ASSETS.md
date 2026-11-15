# IRIS / Visual asset creation & approval system

## Included asset

`assets/iris-amber.webp`: original generated **conceptual macro iris artwork**, 1672×941 source. It contains dramatic organo-fibre structure and a cropped pupil; it is not a client's eye. Used in the demo as a coherent visual thread. Do not claim photographic authenticity of an actual customer.

In production, source a much larger 2500–3500px original if doing deep scroll zooms. Do not upscale the current image and claim new detail. Use a true high-resolution macro capture or generate a sharper new image and inspect it at 100%.

## Asset specifications, not loose theme prompts

### 01 / Hero — exposure plate

**Image goal:** A single, physically believable, hyper-detailed human iris macro plate designed for an off-centre editorial crop. Iris/pupil center around 70–80% canvas width, 43–53% height, with outer radial tissue reaching all frame boundaries. Leftmost 35% is near-black shadow for large legible headline. Copper/amber/brown fibres with occasional cool gray filaments, sharply resolved but organically irregular. Low-key 80mm macro photographic light, one narrow directional source and subtle edge scattering. No eyelashes, face, literal universe, stars, flame, fire, chrome sphere, jewellery or text. 

**Crop plan:** 16:9 master for desktop, separate 4:5 or 9:16 art-directed version for mobile—never rely on `object-position:center` for all aspect ratios.

**Negative constraints:** Not a complete floating eyeball. Not a perfect radial CG disc. No symmetrical mandala. No fake glitter. No banding or repetitive AI fibres. No watermarks.

**QA:** Pupil must be dark and anatomically plausible; tissue must seem to radiate from pupil even when clipped; no strange duplicated pupils. Inspect at 100% and crop 1440×900 and 390×844.

### 02 / Specimen — optical macro

True human iris shown as a coherent anatomical circular specimen, not just fibres. Dark pupil, natural scalloped collarette, radial crypts, nuanced pigment. Compose large enough that it can be partially cropped behind `NO TWO ALIKE`. Use same iris identity as hero if technically feasible, with consistent strand colours and pupil details.

### 03 / Artwork — finished print

Image is centred and properly colour managed on matte archival paper. Art print sits in black anodized or dark oak frame, visible physical profile and realistic glass reflection. Controlled one-sided gallery lighting. No living room stock photo. Use deliberate physical depth: slight 8–14deg rotation, soft accurate contact shadow, not floating vector picture frame.

### 04 / The collection (only if added after hero is approved)

Three **distinct** anatomical iris artworks: amber, glacier-blue and green-hazel. Each needs a full-resolution hero shot and a medium close crop. Avoid re-colouring the same image into three fake species; eye structures should visibly differ. Separate asset metadata: filename, license/creation source, dimensions, purpose, alt, mobile crop, artist permission flag (for real photos).

## Asset prompt example for an image-generation-capable Antigravity setup

"Create an art-directed, photorealistic extreme macro of a real-looking human iris for an interactive fine-art website. Hero is an intentionally cropped, physically credible organic surface, not a circular logo. Iris centre at x=0.74, y=0.48. Black pupil partially visible. Individual irregular fibres, crypts, collarette, fine copper-gold pigmentation with cooler smoke-blue strands, natural imperfections and subtle anisotropic specular lighting. Strong cinema-grade directional light skims the surface, the left 35% falling into nearly absolute black negative space for typography. Deep dynamic range, razor-sharp microtexture, subtle photographic grain. Native widescreen 16:9. No text, no face, no eyelashes, no whole eyeball, no stars, no galaxy, no flames, no symmetric CG mandala, no blur or watermarks."

## Development asset workflow

1. Create/examine artwork **before** coding elaborate shaders.
2. Export masters and named optimised derivatives: desktop hero, mobile hero, specimen, print texture.
3. Define correct intrinsic dimensions in the asset manifest.
4. Inspect compressed files at 100%; zoom no farther than source supports.
5. Test desktop/mobile crop screenshots; reject bad crops.
6. Add imagery into site and label generated works as demonstration art where necessary.
7. Use original first-party customer work only with explicit permission and a privacy process.

**Do not** use random externally hotlinked Unsplash eye photos as final assets. Avoid generic stock replacement when the business relies on unique iris artwork.
