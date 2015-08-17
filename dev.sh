#!/bin/bash

node generate.js "/mnt/compendium/data/Heroes of the Storm" dev
node web/generate "/mnt/compendium/data/Heroes of the Storm" dev
node util/compareRelease.js
