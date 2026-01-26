#!/bin/sh

# Directories to ignore (space-separated)
IGNORE_DIRS="node_modules dist build .git frontend/ios frontend/android explorations out"

# Extensions to ignore (space-separated, no leading dot)
IGNORE_EXTS="jpg png gif svg mp4 mp3 zip gz tar lock ttf woff woff2 xml jar webp pdf jpeg avif log json yml"

# Filenames to ignore (space-separated, no paths)
IGNORE_FILES="package-lock.json"

# Build the exclude pattern for grep
EXCLUDE_PATTERN=""
for d in $IGNORE_DIRS; do
  EXCLUDE_PATTERN="$EXCLUDE_PATTERN|^$d/"
done
for e in $IGNORE_EXTS; do
  EXCLUDE_PATTERN="$EXCLUDE_PATTERN|\\.$e\$"
done
for f in $IGNORE_FILES; do
  EXCLUDE_PATTERN="$EXCLUDE_PATTERN|/$(echo "$f" | sed 's/\./\\./g')\$"
done
# Remove leading |
EXCLUDE_PATTERN="${EXCLUDE_PATTERN#|}"

# Get tracked files, filter out ignores
FILES=$(git ls-files | grep -Ev "$EXCLUDE_PATTERN")

# Count lines per extension + total
(
  total=0
  for f in $FILES; do
    if [ -f "$f" ]; then
      # Extract just the filename (everything after the last /)
      filename="${f##*/}"
      # Remove last extension to check for second-to-last period
      base="${filename%.*}"
      
      if [ "${base}" != "${base%.*}" ]; then
        # There's a second-to-last period, use both extensions
        second_ext="${base##*.}"
        last_ext="${filename##*.}"
        ext="${second_ext}.${last_ext}"
      else
        # Only one extension
        ext="${filename##*.}"
      fi
      
      if [ "$ext" != "" ] && [ "$ext" != "$filename" ]; then
        lines=$(wc -l < "$f")
        echo "$lines .$ext"
      fi
    fi
  done
) | awk '
  {count[$2]+=$1; total+=$1}
  END {
    for (e in count) print count[e], e
    print total, "TOTAL"
  }' | sort -k1,1nr -k2
