#!/bin/bash

# Create directories if they don't exist
mkdir -p public/images/{small,medium,large}

# Array of image files to process
images=("992_gt3.jpg")

# Function to process each image with proper extension handling
process_image() {
    local img=$1
    local base_name="${img%.*}"
    local ext="${img##*.}"

    if [ "$ext" = "png" ]; then
        # For PNG files, strip the color profile
        magick "$img" -strip -resize 800x -quality 90 "public/images/small/${base_name}_small.${ext}"
        magick "$img" -strip -resize 1200x -quality 90 "public/images/medium/${base_name}_medium.${ext}"
        magick "$img" -strip -resize 1600x -quality 90 "public/images/large/${base_name}_large.${ext}"
    else
        # For other image formats
        magick "$img" -resize 800x -quality 90 "public/images/small/${base_name}_small.${ext}"
        magick "$img" -resize 1200x -quality 90 "public/images/medium/${base_name}_medium.${ext}"
        magick "$img" -resize 1600x -quality 90 "public/images/large/${base_name}_large.${ext}"
    fi
}

# Process each image
for img in "${images[@]}"; do
    if [ -f "$img" ]; then
        echo "Processing $img..."
        process_image "$img"
    else
        echo "Warning: $img not found"
    fi
done

echo "Processing complete!"
