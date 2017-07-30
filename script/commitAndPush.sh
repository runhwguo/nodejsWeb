#!/usr/bin/env bash
echo 'should execute in project root direction,like ./script/**.sh'
git add *
git commit -m "优化 .gitignore"
git push
git status