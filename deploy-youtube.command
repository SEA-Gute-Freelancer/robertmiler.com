#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock
git add -A
git commit -m "Replace local videos with YouTube embeds"
git push origin main
echo ""
echo "=== DONE ==="
read -p "Enter zum Schließen..."
