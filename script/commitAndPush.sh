#!/usr/bin/env bash
echo 'should execute in project root direction,like ./script/**.sh'
git add *
git commit -m "增加 1.获取本地ip功能 2.加密文档"
git push
git status