#!/bin/bash
cd "$(dirname "$0")"

echo "=== AI Discoverability Update deployen ==="
git add -A
git status
echo ""

git commit -m "AI Discoverability: JSON-LD + llms.txt

- Schema.org Person + ProfessionalService auf index.html
- Detailliertes Person-Profil auf about.html (Awards, Agenturen, Skills)
- llms.txt für AI-Agent-Discovery
- robots.txt: Hinweis auf llms.txt"

echo ""
echo "=== Push ==="
git push origin main

echo ""
echo "=== DONE ==="
read -p "Enter zum Schließen..."
