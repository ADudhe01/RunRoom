#!/bin/bash
# Quick setup script for Git LFS with 3D models

echo "🚀 Setting up Git LFS for RunRoom 3D models..."

# Check if Git LFS is installed
if ! command -v git-lfs &> /dev/null; then
    echo "❌ Git LFS is not installed."
    echo "📦 Install it with:"
    echo "   macOS: brew install git-lfs"
    echo "   Linux: sudo apt-get install git-lfs"
    echo "   Windows: Download from https://git-lfs.github.com/"
    exit 1
fi

# Initialize Git LFS
echo "✅ Git LFS is installed"
git lfs install

# Track GLB and GLTF files
echo "📝 Tracking *.glb and *.gltf files..."
git lfs track "*.glb"
git lfs track "*.gltf"

# Add .gitattributes
git add .gitattributes

echo ""
echo "✅ Git LFS setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Add your 3D models: git add client/public/models/*.glb"
echo "   2. Commit: git commit -m 'Add 3D models via Git LFS'"
echo "   3. Push: git push origin main"
echo ""
echo "💡 Tip: Compress models first to reduce size:"
echo "   npm install -g gltf-pipeline"
echo "   gltf-pipeline -i model.glb -o model-compressed.glb --draco.compressionLevel 10"

