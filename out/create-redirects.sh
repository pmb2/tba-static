#!/bin/bash
# Script to create necessary redirect files and directories for GitHub Pages

# Set base directory (default to current directory, or use first argument if provided)
BASE_DIR="."
if [[ -n "$1" ]]; then
  BASE_DIR="$1"
fi

# Check if we're already in the out directory
if [[ $(basename "$PWD") == "out" ]]; then
  OUT_DIR="."
else
  OUT_DIR="$BASE_DIR/out"
fi

# Create root .nojekyll file (at repository root) to ensure GitHub Pages doesn't use Jekyll
touch "$BASE_DIR/.nojekyll"
echo "Created root .nojekyll file"

# Create root CNAME file to ensure proper domain configuration
echo "backus.agency" > "$BASE_DIR/CNAME"
echo "Created root CNAME file"

# Function to create redirect from /path/ to /path/index.html
create_redirect() {
  local path=$1
  local target=$2
  local redirect_dir=$(dirname "$path")
  
  # Skip if it's a file and not a directory
  if [[ -f "$path" && ! -d "$path" ]]; then
    return
  fi
  
  # Create redirect HTML
  echo "Creating redirect: $path -> $target"
  mkdir -p "$redirect_dir"
  cat > "$path" << EOF
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=$target">
  <link rel="canonical" href="$target">
  <title>Redirecting...</title>
  <script>window.location.replace("$target");</script>
</head>
<body>
  <p>Redirecting to <a href="$target">$target</a>...</p>
</body>
</html>
EOF
}

echo "Running redirect creation script in $BASE_DIR"
echo "Output directory: $OUT_DIR"

# Create HTML files for URL paths without trailing slashes
# For each path /about/ make sure /about.html exists and redirects to /about/

# Process each subdirectory in the out directory
find "$OUT_DIR" -type d | while read dir; do
  # Skip the out directory itself and hidden directories
  if [[ "$dir" == "$OUT_DIR" || $(basename "$dir") == .* ]]; then
    continue
  fi
  
  # Create redirect if the directory doesn't have an index.html
  if [[ ! -f "$dir/index.html" ]]; then
    # Determine the path relative to out
    relative_path=${dir#$OUT_DIR}
    create_redirect "$dir/index.html" "${relative_path}/index.html"
  fi
  
  # Create a .html file for each directory path
  # E.g., /about.html redirects to /about/index.html
  relative_path=${dir#$OUT_DIR}
  html_file="$OUT_DIR${relative_path}.html"
  
  if [[ ! -f "$html_file" && "$relative_path" != "" ]]; then
    create_redirect "$html_file" "${relative_path}/index.html"
  fi
done

# Create a .nojekyll file
touch "$OUT_DIR/.nojekyll"
echo "Created .nojekyll file"

# Create CNAME file if it doesn't exist
if [[ ! -f "$OUT_DIR/CNAME" ]]; then
  echo "backus.agency" > "$OUT_DIR/CNAME"
  echo "Created CNAME file with backus.agency"
fi

# Add path-fixer.js to all HTML files
echo "Adding path-fixer.js to all HTML files..."
for html_file in $(find "$OUT_DIR" -name "*.html" | grep -v -E "\.git\/|_next\/"); do
  # Check if the script is already included
  if ! grep -q "path-fixer.js" "$html_file"; then
    # Insert the script right before the closing </body> tag
    # Use different approach for MacOS sed
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' 's#</body>#<script src="/path-fixer.js"></script></body>#' "$html_file"
    else
      sed -i 's#</body>#<script src="/path-fixer.js"></script></body>#' "$html_file"
    fi
    echo "Added path-fixer.js to $html_file"
  fi
done

echo "All redirects created successfully"