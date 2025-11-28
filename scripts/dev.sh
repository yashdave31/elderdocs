#!/bin/bash

# ElderDocs Development Server Script
# Starts both Rails and Vite dev servers

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting ElderDocs Development Servers...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "elder_docs.gemspec" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not in elderdocs root directory${NC}"
    echo "Please run this script from the elderdocs root directory"
    exit 1
fi

# Kill existing processes on ports 3000 and 5173
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}   Killing process on port 3000...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -ti:5173 > /dev/null 2>&1; then
    echo -e "${YELLOW}   Killing process on port 5173...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $RAILS_PID $VITE_PID 2>/dev/null || true
    # Kill processes on ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# Start Rails server
echo -e "${GREEN}📦 Starting Rails server on port 3000...${NC}"
cd test_app
bundle exec rails server -p 3000 > /tmp/elderdocs-rails.log 2>&1 &
RAILS_PID=$!
cd ..

# Wait for Rails to start
sleep 3

# Check if Rails started successfully
if ! kill -0 $RAILS_PID 2>/dev/null; then
    echo -e "${YELLOW}❌ Rails server failed to start. Check /tmp/elderdocs-rails.log${NC}"
    exit 1
fi

# Start Vite dev server
echo -e "${GREEN}⚡ Starting Vite dev server on port 5173...${NC}"
cd frontend
npm run dev > /tmp/elderdocs-vite.log 2>&1 &
VITE_PID=$!
cd ..

# Wait for Vite to start
sleep 3

# Check if Vite started successfully
if ! kill -0 $VITE_PID 2>/dev/null; then
    echo -e "${YELLOW}❌ Vite server failed to start. Check /tmp/elderdocs-vite.log${NC}"
    kill $RAILS_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo ""
echo -e "${BLUE}📖 Access points:${NC}"
echo -e "   Rails (ElderDocs): ${GREEN}http://localhost:3000/docs${NC}"
echo -e "   Vite Dev Server:   ${GREEN}http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Use Vite dev server (port 5173) for hot reloading${NC}"
echo -e "${YELLOW}💡 Tip: Use Rails server (port 3000) for production-like testing${NC}"
echo ""
echo -e "${BLUE}📋 Logs:${NC}"
echo "   Rails: /tmp/elderdocs-rails.log"
echo "   Vite:  /tmp/elderdocs-vite.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for processes
wait

