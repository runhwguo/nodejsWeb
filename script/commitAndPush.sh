#!/usr/bin/env bash
echo 'should execute in project root direction,like ./script/**.sh'
git add *
git commit -m "1.安装cnpm 2.增加startProcess.sh脚本"
git push
git status