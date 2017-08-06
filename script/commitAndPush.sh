#!/usr/bin/env bash
echo 'should execute in project script direction'
cd ..
git add *
git commit -m "1.优化脚本"
git push
git status
cd script