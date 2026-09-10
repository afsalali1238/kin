# kinē body asset contract

## Assets shipped

- `male.glb`, `female.glb`: real external skin geometry derived from MakeHuman hm08 `base.obj` and Caucasian young-adult macro targets. 26,756 triangles, approximately 787 KB each; one indexed primitive and smooth vertex normals. No capsule mannequin. Source assets explicitly CC0.
- `body-regions.png`: 2048² RGB region-ID atlas in the source OBJ UV layout. 31 coarse anatomical regions; colours correspond to `src/data/regions.json`. Approximate anatomical boundaries are classified per UV texel from barycentrically interpolated source-skin positions, with non-overwriting island gutters. **Not a clinically signed-off fine-grained anatomical segmentation.**
- `skin-albedo.jpg`, `skin-normal.png`: small procedurally authored colour/pore textures, not a scan. Total current assets about 2.1 MB uncompressed on disk.
- Source: https://github.com/makehumancommunity/makehuman/tree/master/makehuman/data . Mesh attribution is embedded in upstream `base.obj`; copyright holders include Data Collection AB, Joel Palmius, Jonas Hauquier. Core graphical assets CC0: https://static.makehumancommunity.org/mpfb/faq/is_it_really_free.html .

## Production replacement requirements

1. External, neutral anatomical skin mesh in metres, Y up, feet at Y=0, crown about Y=1.8, face toward +Z. Subject's left is +X. Neutral A pose, no accessories or helper meshes. Preserve all target centroids in the editable region data or update those records.
2. Target 40k–80k clinically useful triangles (do not subdivide just to hit a count), seamless normals, no duplicated overlapping regional surfaces. One skin primitive. Separate eyes are permitted if needed.
3. Use non-mirrored, non-overlapping mask UVs. Current assets use `TEXCOORD_0` from OBJ with V=0 at the bottom. **The external region PNG uses `flipY=true`**; the CPU picker uses `y=(1-v)*height`. glTF-exported replacement textures often use top-origin V, so align both paths explicitly. If beauty UVs are mirrored, provide a dedicated `TEXCOORD_1` mask UV and update picker/shader together.
4. PBR textures: sRGB albedo with neutral lighting; tangent-space normal (pores and wrinkles, intensity tuned per model); linear roughness (about .45–.65, lower on forehead/shoulders); linear AO in a distinct AO UV channel. Avoid baked specular or directional shadows. Optional sparse facial/skin detail overlays.
5. 2048² flat RGB region mask, PNG, no antialiasing, no lighting, no lossy compression, no colour-management conversion. `NoColorSpace`, nearest filtering, no mipmaps. Keep at least 4-pixel UV island gutters. Current colours are `[7*(index+1),40,80]`, and the shader/picker identify the red channel; a larger catalog should switch both to full RGB decoding. Never reuse an ID on left and right.
6. Author the complete fine-grained region list in the brief: face subdivisions, all shoulder surfaces, muscular subdivisions, lumbar vs sacrum vs glutes, knee surfaces, Achilles vs heel vs foot arch. Current coarse atlas covers clinical families but does not yet separate all these sites. Annotate anatomical boundaries in the mesh's UV space, not in screen coordinates.
7. Compress with Draco or meshopt and KTX2/Basis only after all regional QA passes. Target **≤6 MB combined** for both bodies and shared maps. Existing raw GLBs are deliberately very small and don't need an external decoder; a compressed replacement must register its decoder in `BodyViewer`.
8. Optional glTF skeleton and named motion clips for exercise education. The shipped skin GLBs are static; idle breathing is shader deformation, not a joint rig. Do not replace actual exercise instruction with arbitrary joint animations.

## Rendering contract

`BodyViewer` exposes region ID, front/back, body type, reset, zoom, up to five pins, and `onSelect(id, worldPoint)`. Other app components do not import Three. The main scene uses a 35° lens, ACES, three-point warm/cool lighting, contact shadows, wrap diffuse + warm grazing-angle term, and 0.2 Hz / 0.4% torso breathing. Cached geometry/textures are shared between viewer instances; owned materials, intervals and controls are cleaned up. Geometry cache lives for the browser session to avoid repeated downloads. There is no remote environment-map dependency.

## Acceptance checks before replacing assets

- Click actual skin and confirm the label and shader agree; specifically lumbar must not highlight glutes or thighs.
- Check both sexes, both orientations, both sides, and UV seams.
- Pin offset must remain outside skin at zoom limits. Current pins are adjusted by re-tapping; continuous drag re-raycasting is not yet implemented.
- Test on real mid-range Android hardware over throttled 4G. Demand rendering and DPR safeguards are implemented, but **60 fps and <3-second cold-interactive are not certified performance results**.
- A render-failure/WebGL2 fallback must retain the region-ID callback contract. The fallback is a vector body map, not a photograph.
