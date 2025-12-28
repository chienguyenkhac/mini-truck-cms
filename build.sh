#!/bin/bash

# Build admin_ui first
echo "Building admin_ui..."
cd admin_ui
npm install
npm run build

# Copy admin_ui build to dist/secret
echo "Copying admin_ui to dist/secret..."
cd ..
mkdir -p dist/secret
cp -r admin_ui/dist/* dist/secret/

# Build main frontend
echo "Building main frontend..."
npm install
npm run build

echo "Build complete!"





