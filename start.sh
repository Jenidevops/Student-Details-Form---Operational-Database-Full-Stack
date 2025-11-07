#!/bin/bash

# 🚀 Full-Stack Application Launcher Script
# This script starts both backend and frontend

echo "=================================="
echo "🚀 Starting Full-Stack Application"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo "${BLUE}📊 Checking MongoDB...${NC}"
if pgrep -x "mongod" > /dev/null; then
    echo "${GREEN}✅ MongoDB is running${NC}"
else
    echo "${RED}❌ MongoDB is not running!${NC}"
    echo "Please start MongoDB first:"
    echo "  brew services start mongodb-community"
    exit 1
fi

echo ""
echo "${BLUE}🔧 Starting Backend Server...${NC}"
cd "mongodbtask"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Start backend in background
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend started successfully
if curl -s http://localhost:3000/health > /dev/null; then
    echo "${GREEN}✅ Backend is running on http://localhost:3000${NC}"
else
    echo "${RED}❌ Failed to start backend${NC}"
    exit 1
fi

echo ""
echo "${BLUE}🎨 Opening Frontend...${NC}"
cd "../student details task"
open "index-connected.html"

echo ""
echo "${GREEN}✅ Full-Stack Application is now running!${NC}"
echo ""
echo "📝 Next Steps:"
echo "  1. Your browser should open automatically"
echo "  2. Look for the green 'Connected' badge"
echo "  3. Try adding a student to test the integration"
echo ""
echo "🛑 To stop the backend server:"
echo "  kill $BACKEND_PID"
echo ""
echo "📚 Read INTEGRATION_GUIDE.md for detailed instructions"
echo "=================================="
