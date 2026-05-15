#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock
git add vercel.json
git commit -m "Add vercel.json for static site deployment"
git push origin main
echo ""
echo "=== DONE ==="
echo "Vercel sollte jetzt auto-deployen. Warte 1-2 Minuten, dann check die URL."
read -p "Enter zum Schließen..."
