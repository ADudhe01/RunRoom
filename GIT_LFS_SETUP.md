# Git LFS Setup for 3D Models

## What is Git LFS?

Git LFS (Large File Storage) is a Git extension that stores large files outside the main Git repository, allowing you to version control files larger than GitHub's 100MB limit.

## Installation

### macOS

```bash
brew install git-lfs
```

### Linux

```bash
# Ubuntu/Debian
sudo apt-get install git-lfs

# Or download from: https://git-lfs.github.com/
```

### Windows

Download and install from: https://git-lfs.github.com/

## Setup for RunRoom

### 1. Install Git LFS (if not already installed)

```bash
git lfs install
```

### 2. Track GLB/GLTF files

```bash
cd /Users/atharvad/Documents/development/runroom
git lfs track "*.glb"
git lfs track "*.gltf"
```

This creates/updates a `.gitattributes` file.

### 3. Update .gitignore

Remove `*.glb` and `*.gltf` from `.gitignore` since Git LFS will handle them.

### 4. Add the .gitattributes file

```bash
git add .gitattributes
git commit -m "Add Git LFS tracking for 3D models"
```

### 5. Add your 3D models

```bash
git add client/public/models/*.glb
git commit -m "Add 3D model files via Git LFS"
```

### 6. Push to GitHub

```bash
git push origin main
```

## Important Notes

- **GitHub LFS Limits**:
  - Free accounts: 1GB storage, 1GB bandwidth/month
  - Paid accounts: 50GB storage, 50GB bandwidth/month
- **File Size**: Git LFS can handle files up to several GB
- **Cloning**: When someone clones the repo, they'll automatically download LFS files
- **Cost**: Free tier should be sufficient for a few 3D models

## Verify LFS is Working

```bash
# Check which files are tracked by LFS
git lfs ls-files

# Check LFS status
git lfs status
```
