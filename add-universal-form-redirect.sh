#!/bin/bash

# Script to add the universal-form-redirect.js script to all HTML files
# This handles both source HTML files and built HTML files in the out directory

# List of directories to process
DIRS=("" "about" "blog" "blog/1" "blog/2" "blog/3" "blog/4" "blog/5" "blog/6" "blog/7" "contact" "cookie-policy" "marketing" "our-work" "pricing" "privacy-policy" "sitemap" "terms-of-service")

# Process source files (original HTML files)
echo "Processing source HTML files..."
for dir in "${DIRS[@]}"; do
    # Handle empty directory (root) case
    if [ -z "$dir" ]; then
        file="index.html"
    else
        file="$dir/index.html"
    fi
    
    # Check if file exists
    if [ -f "$file" ]; then
        # Check if the script is already included
        if ! grep -q "universal-form-redirect.js" "$file"; then
            # Insert the script after the head tag
            sed -i '/<head>/a \
  <!-- Form interception script first to catch everything else -->\
  <script src="/js/universal-form-redirect.js"></script>' "$file"
            echo "Added script to $file"
        else
            echo "Script already exists in $file"
        fi
    else
        echo "File $file does not exist"
    fi
done

# Process built files (out directory)
echo "Processing out/ HTML files..."
for dir in "${DIRS[@]}"; do
    # Handle empty directory (root) case
    if [ -z "$dir" ]; then
        file="out/index.html"
    else
        file="out/$dir/index.html"
    fi
    
    # Check if file exists
    if [ -f "$file" ]; then
        # Check if the script is already included
        if ! grep -q "universal-form-redirect.js" "$file"; then
            # Insert the script after the head tag
            sed -i '/<head>/a \
  <!-- Form interception script first to catch everything else -->\
  <script src="/js/universal-form-redirect.js"></script>' "$file"
            echo "Added script to $file"
        else
            echo "Script already exists in $file"
        fi
    else
        echo "File $file does not exist"
    fi
done

echo "Script addition complete"
