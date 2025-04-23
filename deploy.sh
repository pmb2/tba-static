#\!/bin/bash

# TBA Static Site Deploy Script
# This script helps deploy the site properly to the root directory

echo "Starting deployment process..."

# 1. Check if we're in the right directory
if [ \! -f "next.config.js" ]; then
  echo "Error: Make sure you're running this script from the root of the project where next.config.js is located."
  exit 1
fi

# 2. Build the project if we have package.json
if [ -f "package.json" ]; then
  echo "Building project with Next.js..."
  npm run build
else
  echo "No package.json found, skipping build step."
fi

# 3. Ensure directories exist
mkdir -p js
mkdir -p images
mkdir -p css

# 4. Copy files from /out/ to root if /out/ exists and we need to do this manual step
if [ -d "out" ]; then
  echo "Copying files from /out/ to root..."
  
  # Copy all files preserving directory structure
  cp -r out/* .
  
  # Ensure key JavaScript files exist
  if [ -f "out/js/form-handler.js" ]; then
    cp -f out/js/form-handler.js js/
  fi
  
  if [ -f "out/js/modal.js" ]; then
    cp -f out/js/modal.js js/
  fi
  
  if [ -f "out/form-fixer.js" ]; then
    cp -f out/form-fixer.js .
  fi
  
  if [ -f "out/path-fixer.js" ]; then
    cp -f out/path-fixer.js .
  fi
fi

# 5. Create essential GitHub Pages files
echo "Creating GitHub Pages specific files..."
touch .nojekyll
echo "backus.agency" > CNAME

# 6. Fix common issues
echo "Fixing common issues..."

# Ensure form-fixer.js exists at the root
if [ \! -f "form-fixer.js" ] && [ -f "js/form-fixer.js" ]; then
  cp js/form-fixer.js .
fi

# Ensure path-fixer.js exists at the root
if [ \! -f "path-fixer.js" ] && [ -f "js/path-fixer.js" ]; then
  cp js/path-fixer.js .
fi

# 7. Final confirmation
echo "Deployment preparation complete\!"
echo "Make sure to commit and push these changes to your GitHub repository."
echo ""
echo "Run: git add . && git commit -m 'Prepare for deployment' && git push"
