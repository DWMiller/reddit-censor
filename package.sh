#!/bin/sh
# Builds the zip to upload to the Chrome Web Store. Only extension files go in; store/ and test/ stay out.
set -e
cd "$(dirname "$0")"
version=$(sed -n 's/.*"version": "\(.*\)".*/\1/p' manifest.json)
mkdir -p dist
out="dist/username-censor-for-reddit-$version.zip"
rm -f "$out"
zip -q -X "$out" manifest.json index.js censor.js icons/icon16.png icons/icon32.png icons/icon48.png icons/icon128.png
echo "$out"
