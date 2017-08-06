#!/usr/bin/env bash
./clearProject.sh
./killProjectPortProcess.sh
npm run build
npm run start