#!/bin/bash

node generate.js "/mnt/compendium/tmp/Heroes of the Storm" dev
node web/generate "/mnt/compendium/tmp/Heroes of the Storm" dev
node util/compareRelease.js
