#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock
git rm lausitz.html
git add -A
git commit -m "Lausitz komplett entfernt (Seite, Kachel, Navigation, Sitemap)"
git push origin main
echo ""
echo "=== DONE ==="
read -p "Enter zum Schließen..."
