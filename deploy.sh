#!/bin/bash

# Show commands as they're executed
set -x

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment process...${NC}"

# Step 1: Install dependencies if needed
echo -e "${YELLOW}Checking dependencies...${NC}"
if [ ! -d "node_modules" ] || [ ! -d "functions/node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  cd functions && npm install && cd ..
fi

# Step 2: Build the project
echo -e "${YELLOW}Building project...${NC}"
npm run build

# Step 3: Update Firebase functions
echo -e "${YELLOW}Building Firebase functions...${NC}"
cd functions && npm run build && cd ..

# Step 4: Deploy to Firebase
echo -e "${YELLOW}Deploying to Firebase...${NC}"
firebase deploy

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
  echo -e "${GREEN}Your authentication pages and Firebase setup should now be live.${NC}"
  echo -e "${GREEN}Visit your Firebase hosting URL to see the changes.${NC}"
else
  echo -e "${RED}✗ Deployment failed. Please check the error messages above.${NC}"
  echo -e "${YELLOW}If you encounter ESLint errors, try running:${NC}"
  echo -e "${YELLOW}cd functions && npm run lint -- --fix${NC}"
fi 