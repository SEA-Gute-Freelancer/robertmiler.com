#!/bin/bash
cd "$(dirname "$0")"

echo "=== Lausitz-Ordner physisch löschen ==="
rm -rf public/projekte/lausitz/
echo "Gelöscht."

echo ""
echo "=== Auch lausitz.html und overlay-test.html entfernen ==="
rm -f lausitz.html overlay-test.html
echo "Gelöscht."

echo ""
echo "=== Frisches Git-Repo erstellen (ohne Lausitz) ==="
REMOTE=$(git remote get-url origin 2>/dev/null)
rm -rf .git
git init
git checkout -b main
git add -A
git commit -m "Creative Director Game v2.0 + Desktop Easter Egg

- Komplettes Game mit 4 Akten, 3 Enden (Plagiat/Team/Kunde)
- Alle neuen Videos: newton, greatness, believe, Ansage, feierabend
- Desktop-Icon Easter Egg auf Homepage
- Lausitz komplett entfernt inkl. History-Bereinigung"

echo ""
echo "=== Remote setzen und Force-Push ==="
git remote add origin "$REMOTE"
git push origin main --force

echo ""
echo "=== DONE ==="
read -p "Enter zum Schließen..."
