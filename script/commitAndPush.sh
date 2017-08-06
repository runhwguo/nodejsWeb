#!/usr/bin/env bash
echo 'should execute in project script direction'
cd ..
git add *
git commit -m "1.html标签有一些默认行为， 去除reduplicate属性"
git push
git status
cd script