#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock
git add -A
git commit -m "Projekt-Umbau: UNHATE, Vereinsgeschichte, Mezzo Mix, OOH + Fixes"
git push origin main
echo ""
echo "=== DONE ==="
read -p "Enter zum Schließen..."
