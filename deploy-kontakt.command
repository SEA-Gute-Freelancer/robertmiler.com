#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock
git add -A
git commit -m "Contact form, resizable windows, dot fix, about portrait, BMWK carousel fix, Hörakustiker image"
git push origin main
echo ""
echo "=== DONE ==="
read -p "Enter zum Schließen..."
