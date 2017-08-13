#!/usr/bin/env bash
echo 'should execute in project script direction'
cd ..
git add *
git commit -m "1.给一些明文代码加密 2.上传.jar 工具"
git push
git status
cd script