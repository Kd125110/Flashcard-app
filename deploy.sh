#!/bin/bash

# Install dependencies
npm install

# Build frontend
npm run start:all

# The built files should be in dist/apps/frontend

# Backend should be ready to run
echo "Deployment complete"
