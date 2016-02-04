#!/bin/bash

echo "Geting CASCExtractor..."
git submodule update --init --recursive

echo "Building CASCExtractor..."
mkdir build
cd build
cmake ../CASCExtractor
make

echo "Installing NPM modules..."
cd ../
npm install

echo "Linking shared JS..."
cd node_modules
ln -s ../shared/C.js

echo "Done."
