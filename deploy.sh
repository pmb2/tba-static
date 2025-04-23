#!/bin/bash
# Script to deploy the website by moving content from /out/ to the root directory

# Exit on error
set -e

echo "Starting deployment process..."

# Create necessary directories if they don't exist
mkdir -p js
mkdir -p images
mkdir -p _next

# Copy all files from out directory to root, but don't overwrite the ones we've modified
echo "Copying files from /out to root directory..."
cp -rn out/* .

# Make sure the JS files are in the right place
echo "Copying JavaScript files to proper location..."
cp -f out/js/form-handler.js js/
cp -f out/form-fixer.js .
cp -f out/path-fixer.js .

# Ensure images are copied
echo "Copying image files..."
cp -rf out/images/* images/

# Ensure _next directory (for Next.js assets) is properly copied
echo "Copying Next.js assets..."
cp -rf out/_next/* _next/

# Create .nojekyll file for GitHub Pages
echo "Creating .nojekyll file..."
touch .nojekyll

# Ensure CNAME is present
echo "Creating CNAME file..."
echo "backus.agency" > CNAME

echo "Deployment completed successfully!"
echo "Website should now be accessible directly from the root URL."