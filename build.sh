#!/bin/bash

echo "Geting CascLib..."
git submodule init
git update

echo "Building CascLib..."
mkdir CascLib-build
cd CascLib-build
cmake ../CascLib/
make

echo "Building cascextract..."

echo "Done."
