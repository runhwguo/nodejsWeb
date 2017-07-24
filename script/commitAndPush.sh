#!/usr/bin/env bash
echo 'should execute in project root direction,like ./script/**.sh'
git add *
git commit -m "优化代码，完整项目结构，test/production 代码无感知"
git push
git status