#!/bin/bash

# Test script for Syntaxesia pipeline
# This script verifies both APIs are running and can communicate

echo "🧪 Testing Syntaxesia Pipeline"
echo "================================"
echo ""

# Test 1: Python Extraction API
echo "1️⃣  Testing Python Extraction API (port 5001)..."
PYTHON_HEALTH=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:5001/api/health 2>/dev/null)

if [ "$PYTHON_HEALTH" = "200" ]; then
    echo "   ✅ Python API is running"
    curl -s http://localhost:5001/api/health | jq '.'
else
    echo "   ❌ Python API is NOT running (got HTTP $PYTHON_HEALTH)"
    echo "   👉 Start it with: cd extraction && python api.py"
    exit 1
fi

echo ""

# Test 2: Node Placard API
echo "2️⃣  Testing Node Placard API (port 3001)..."
NODE_HEALTH=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/health 2>/dev/null)

if [ "$NODE_HEALTH" = "200" ]; then
    echo "   ✅ Node API is running"
    curl -s http://localhost:3001/health | jq '.'
else
    echo "   ❌ Node API is NOT running (got HTTP $NODE_HEALTH)"
    echo "   👉 Start it with: cd placard && node server.js"
    exit 1
fi

echo ""

# Test 3: Check if repo_data.json exists
echo "3️⃣  Checking for existing repo_data.json..."
if [ -f "/Users/melindayong/syntaxesia/extraction/repo_data.json" ]; then
    echo "   ✅ repo_data.json exists"
    SIZE=$(ls -lh /Users/melindayong/syntaxesia/extraction/repo_data.json | awk '{print $5}')
    echo "   📊 File size: $SIZE"
else
    echo "   ⚠️  repo_data.json not found"
    echo "   👉 Run an extraction first via test.html"
fi

echo ""

# Test 4: CORS test (check if extraction API allows cross-origin)
echo "4️⃣  Testing CORS configuration..."
CORS_HEADER=$(curl -s -I -H "Origin: http://localhost:3001" http://localhost:5001/api/health 2>/dev/null | grep -i "access-control-allow-origin")

if [ -n "$CORS_HEADER" ]; then
    echo "   ✅ CORS is configured"
    echo "   $CORS_HEADER"
else
    echo "   ❌ CORS is NOT configured properly"
    echo "   👉 Make sure api.py has: CORS(app, resources={r\"/*\": {\"origins\": \"*\"}})"
fi

echo ""
echo "================================"
echo "🎯 Next steps:"
echo "   1. Open http://localhost:3001/test.html in your browser"
echo "   2. Enter a GitHub URL (e.g., https://github.com/pallets/flask)"
echo "   3. Click 'Run Full Pipeline'"
echo ""
