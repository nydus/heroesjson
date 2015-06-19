#!/bin/bash

echo "Geting CASCExtractor..."
git submodule update --init --recursive

echo "Building CASCExtractor..."
cd CASCExtractor
mkdir build
cd build
cmake ..
make

echo "Done."
