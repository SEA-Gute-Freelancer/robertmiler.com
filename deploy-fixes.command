#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock
git add -A
git commit -m "Fix: Vereinsgeschichte image path + SEA window drag-click bug"
git push origin main
echo ""
echo "=== DONE ==="
read -p "Enter zum Schließen..."
