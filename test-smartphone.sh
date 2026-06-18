#!/bin/bash
# ────────────────────────────────────────────
# MemoLife Smartphone Testing Setup
# Usage: ./test-smartphone.sh
# ────────────────────────────────────────────

set -e

echo "📱 MemoLife Smartphone Testing Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get machine IP
echo "🔍 Detecting your machine IP..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    MACHINE_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
else
    # Linux
    MACHINE_IP=$(hostname -I | awk '{print $1}')
fi

echo "✅ Your machine IP: $MACHINE_IP"
echo ""

# Ensure backend is running
echo "🚀 Checking backend..."
if ! curl -s http://127.0.0.1:8000/health > /dev/null; then
    echo "❌ Backend is not running!"
    echo ""
    echo "Start backend with:"
    echo "  cd backend"
    echo "  ./venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
    echo ""
    exit 1
fi
echo "✅ Backend is running on port 8000"
echo ""

# Update frontend .env
echo "📝 Updating frontend configuration..."
FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/frontend"

cat > "$FRONTEND_DIR/.env.local" << EOF
# MemoLife Frontend Configuration
# Updated for smartphone testing

EXPO_PUBLIC_API_URL=http://$MACHINE_IP:8000
EOF

echo "✅ Updated $FRONTEND_DIR/.env.local"
echo "   EXPO_PUBLIC_API_URL=http://$MACHINE_IP:8000"
echo ""

# Start Expo
echo "📱 Starting Expo development server..."
echo ""
echo "Next steps:"
echo "  1. Scan QR code with Expo Go app (iOS/Android)"
echo "  2. Or open link in browser and select device"
echo ""
echo "Make sure your smartphone is on the same WiFi network"
echo "as this machine ($MACHINE_IP)"
echo ""

cd "$FRONTEND_DIR"
npx expo start

echo ""
