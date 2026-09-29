#!/bin/sh
# Renders icons and store images from store/src with headless Chrome. Needs ImageMagick.
set -e
cd "$(dirname "$0")/.."
chrome="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

shot() { # width height out src [background]
  "$chrome" --headless --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=4000 \
    --default-background-color="${5:-000000ff}" --window-size="$1,$2" \
    --screenshot="$PWD/$3" "file://$PWD/store/src/$4" >/dev/null 2>&1
}

shot 128 128 icons/icon128.png icon.svg 00000000
shot 96 96 icons/small.png icon-small.svg 00000000
for size in 16 32 48; do
  magick icons/small.png -resize "${size}x${size}" "PNG32:icons/icon$size.png"
done
rm icons/small.png

# The store rejects images with an alpha channel.
flat() {
  shot "$1" "$2" "store/$3.png" "$3.html"
  magick "store/$3.png" -alpha remove -alpha off "PNG24:store/$3.png"
}
flat 1280 800 screenshot-1
flat 1280 800 screenshot-2
flat 1280 800 screenshot-3
flat 440 280 promo-small
flat 1400 560 promo-marquee
