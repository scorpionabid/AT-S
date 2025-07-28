#!/bin/bash

# ATİS Frontend Development Script
# Bu script frontend development üçün cache təmizləmə və hot reload təmin edir

echo "🚀 ATİS Frontend Development - Cache Clear & Start"
echo "================================================="

# Frontend directory-ə keç
cd frontend

echo "📦 Node modules cache təmizləmə..."
rm -rf node_modules/.cache
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite

echo "🧹 Vite cache təmizləmə..."
npx vite --clearCache

echo "🔄 Dependencies yenidən yüklənir..."
npm install --force

echo "⚡ Development server başlanır..."
echo "Local: http://localhost:3001"
echo "Network: http://192.168.1.27:3001"
echo ""
echo "CTRL+C ilə dayandıra bilərsiniz"
echo "🎯 Dəyişikliklər real-time tətbiq olunacaq!"

npm run dev --force