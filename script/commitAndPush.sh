#!/usr/bin/env bash
echo 'should execute in project script direction'
cd ..
git add *
git commit -m "1.安装cnpm 2.增加startProcess.sh脚本 3.脚本应该在script目录下执行"
git push
git status
cd script