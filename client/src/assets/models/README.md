# 3D Models Directory

This directory should contain GLTF/GLB model files for 3D room items.

## ⚠️ IMPORTANT: Where to Place Models

**Models must be placed in:** `client/public/models/` (NOT in this assets folder)

The app looks for models at `/models/[item-sku].glb` which maps to the `public/models/` directory.

## 📥 Where to Download Free 3D Models

### Best Sources for Free Low-Poly Furniture Models:

1. **Sketchfab** (https://sketchfab.com)

   - Search for "low poly furniture" or "low poly bedroom"
   - Filter by: Free, Downloadable, GLTF format
   - Great selection of bedroom items
   - Example searches: "low poly lamp", "low poly table", "low poly plant"

2. **Poly Haven** (https://polyhaven.com/models)

   - Free, CC0 licensed models
   - Good quality low-poly assets
   - Download as GLTF/GLB

3. **Free3D** (https://free3d.com)

   - Search for "low poly furniture gltf"
   - Many free options available

4. **TurboSquid Free** (https://www.turbosquid.com/Search/3D-Models/free)

   - Filter by: Free, GLTF format
   - Professional quality models

5. **CGTrader Free** (https://www.cgtrader.com/free-3d-models)
   - Search for "low poly furniture glb"
   - Many free bedroom items

Exact file names needed: 1. **Sketchfab** (https://sketchfab.com)
Your shop has 8 items. Name downloaded models exactly like this:

1. poster.midnight-grid.glb (for Midnight Grid Poster)
2. light.aurora-bar.glb (for Aurora Glow Bar)
3. plant.moss-wall.glb (for Moss Wall Planter)
4. shelf.altitude.glb (for Altitude Floating Shelf)
5. lamp.ready-set.glb (for Ready-Set Smart Lamp)
6. sofa.clubhouse.glb (for Clubhouse Loveseat)
7. mat.stride-lab.glb (for Stride Lab Mat)
8. table.recovery-station.glb (for Recovery Capsule Table)

### Recommended Model Specifications:

- **Format**: GLB (preferred) or GLTF
- **Poly count**: Low-poly (under 5000 triangles per object)
- **Size**: Keep files under 5MB for web performance
- **Textures**: Embedded in GLB or separate files (GLB preferred)

## 📝 Model Naming

Models should be named to match the item's `sku` field from the database. For example:

- Item with SKU `"lamp.aurora-bar"` → `lamp.aurora-bar.glb`
- Item with SKU `"table.recovery-station"` → `table.recovery-station.glb`
- Item with SKU `"plant.moss-wall"` → `plant.moss-wall.glb`

To find your item SKUs, check the database or look at the shop items in your app.

## 🔄 Fallback Behavior

If a model file is not found, the app will automatically use fallback geometry based on the item's category:

- Lamps → Cylinder
- Plants → Cone
- Tables → Flat Box
- Chairs → Box
- Posters → Plane
- Shelves → Box

**You don't need models to test the app** - it works with fallback shapes!

## 📦 Adding Models - Step by Step

1. **Download a GLB model** from one of the sources above
2. **Check the item SKU** in your database or shop (e.g., `"lamp.aurora-bar"`)
3. **Rename the file** to match the SKU: `lamp.aurora-bar.glb`
4. **Place it in**: `client/public/models/lamp.aurora-bar.glb`
5. **Restart your dev server** if needed
6. **The app will automatically load it** when the item is placed in the room

## 🎨 Quick Start Example

Let's say you want to add a lamp model:

1. Go to Sketchfab.com
2. Search: "low poly lamp glb"
3. Download a free model (GLB format)
4. Rename it to match your lamp item's SKU (e.g., `lamp.aurora-bar.glb`)
5. Place in: `client/public/models/lamp.aurora-bar.glb`
6. Done! The model will appear in your 3D room

## 💡 Tips

- Start with 1-2 models to test, then add more
- Low-poly models work best for web performance
- GLB format is preferred (single file, includes textures)
- If a model doesn't load, check browser console for errors
- Make sure file names match SKUs exactly (case-sensitive)
