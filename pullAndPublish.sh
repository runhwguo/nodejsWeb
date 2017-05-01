#!/usr/bin/env bash
git pull && cd build && gulp && cd ..
NODE_ENV=test
node --use_strict start.js
