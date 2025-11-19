# 3D Models Storage Options for RunRoom

## Option 1: Git LFS (Recommended for GitHub) ✅

**Best for**: Keeping models in the repository, version control, easy collaboration

### Pros:
- Models stay in the repository
- Version control for model changes
- Easy for collaborators to get models
- Works seamlessly with GitHub

### Cons:
- Limited free storage (1GB on free tier)
- Bandwidth limits
- Requires Git LFS installation

### Setup:
See `GIT_LFS_SETUP.md` for detailed instructions.

**Answer to your question**: Yes! Git LFS will allow you to push 3D models to GitHub, even if they're larger than 50MB. The free tier gives you 1GB of storage, which is plenty for several 3D models.

---

## Option 2: Hosting Models on a CDN

**Best for**: Production apps, many models, large files, better performance

### Popular CDN Options:

#### A. Cloudinary (Free tier: 25GB storage)
```javascript
// In your code, load from CDN:
const modelPath = `https://res.cloudinary.com/your-cloud-name/raw/upload/v1234567890/models/${item.sku}.glb`;
```

#### B. AWS S3 + CloudFront
```javascript
const modelPath = `https://d1234567890.cloudfront.net/models/${item.sku}.glb`;
```

#### C. GitHub Releases (Free, unlimited)
1. Create a release in your GitHub repo
2. Upload GLB files as release assets
3. Reference them:
```javascript
const modelPath = `https://github.com/ADudhe01/RunRoom/releases/download/v1.0.0/${item.sku}.glb`;
```

#### D. Vercel/Netlify Static Hosting
If you deploy frontend to Vercel/Netlify, you can serve models from `public/models/`:
```javascript
const modelPath = `/models/${item.sku}.glb`; // Works in production
```

### Implementation Example:

Update `Room3D.jsx` to support CDN URLs:

```javascript
// In RoomItem component
const getModelPath = () => {
  const sku = item.sku || item.id;
  
  // Option 1: Check for CDN URL in environment variable
  const CDN_BASE_URL = import.meta.env.VITE_MODELS_CDN_URL;
  if (CDN_BASE_URL) {
    return `${CDN_BASE_URL}/${sku}.glb`;
  }
  
  // Option 2: Fallback to local
  return `/models/${sku}.glb`;
};

const modelPath = getModelPath();
```

### Pros:
- No repository size limits
- Better performance (CDN caching)
- Can serve many large files
- Professional production setup

### Cons:
- Requires separate hosting setup
- Additional cost for large traffic
- Models not in version control
- More complex deployment

---

## Option 3: Compressed/Smaller Model Files

**Best for**: Reducing file sizes, faster loading, better performance

### Compression Tools:

#### A. gltf-pipeline (Official GLTF optimizer)
```bash
npm install -g gltf-pipeline

# Compress a GLB file
gltf-pipeline -i input.glb -o output.glb --draco.compressionLevel 10

# Or convert GLTF to GLB and compress
gltf-pipeline -i input.gltf -o output.glb --draco.compressionLevel 10
```

#### B. gltf-transform (More options)
```bash
npm install -g @gltf-transform/cli

# Compress with multiple optimizations
gltf-transform optimize input.glb output.glb \
  --texture-compress webp \
  --simplify \
  --resize
```

#### C. Online Tools:
- [glTF.report](https://gltf.report/) - Analyze and optimize
- [Babylon.js Sandbox](https://sandbox.babylonjs.com/) - Preview and export optimized

### Compression Example Workflow:

```bash
# 1. Install gltf-pipeline
npm install -g gltf-pipeline

# 2. Compress your model
cd client/public/models
gltf-pipeline -i light.aurora-bar.glb -o light.aurora-bar-compressed.glb \
  --draco.compressionLevel 10 \
  --draco.quantizePositionBits 14 \
  --draco.quantizeNormalBits 10

# 3. Check file size reduction
ls -lh *.glb
```

### Typical Size Reductions:
- **Uncompressed**: 52MB
- **With Draco compression**: 5-15MB (70-90% reduction!)
- **With texture optimization**: Even smaller

### Pros:
- Much smaller file sizes
- Faster loading times
- Better user experience
- Can still use Git/GitHub normally

### Cons:
- Slight quality loss (usually imperceptible)
- Requires compression step
- May need to re-export from 3D software

---

## Recommended Approach for RunRoom

### For Development:
1. **Use Git LFS** - Easy to manage, keeps models in repo
2. **Compress models** - Reduce sizes before committing

### For Production:
1. **Compress models** first (reduce 52MB → 5-10MB)
2. **Use Git LFS** for version control
3. **Optionally use CDN** if you have many models or high traffic

### Quick Start (Recommended):

```bash
# 1. Install Git LFS
brew install git-lfs  # macOS
git lfs install

# 2. Track GLB files
git lfs track "*.glb"
git lfs track "*.gltf"

# 3. Compress your model (optional but recommended)
npm install -g gltf-pipeline
cd client/public/models
gltf-pipeline -i light.aurora-bar.glb -o light.aurora-bar.glb \
  --draco.compressionLevel 10

# 4. Add and commit
git add .gitattributes
git add client/public/models/*.glb
git commit -m "Add compressed 3D models via Git LFS"
git push origin main
```

This gives you:
- ✅ Models in repository (version controlled)
- ✅ Smaller file sizes (faster loading)
- ✅ No GitHub size limit issues
- ✅ Easy for collaborators

