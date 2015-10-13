Intro
-----

This project extracts data from Heroes of the Storm data files into JSON files.

This is then used to generate the website: [http://heroesjson.com](http://heroesjson.com)

It is meant to run in Linux. To run you need:
* nodejs
* git
* cmake

Build
-----

    git clone https://github.com/Sembiance/heroesjson.git
    cd heroesjson
    ./build.sh

Run
---
    node generate.js /path/to/heroes/install/dir

SEE howto.txt FOR MORE DETAILS ON HOW TO RUN

Results
-------

The resulting JSON files will be in the 'out' directory.
