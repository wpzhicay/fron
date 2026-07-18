#!/bin/bash
echo "Building Angular frontend..."
npm run build
if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
fi

echo "Starting Express server..."
npm start
