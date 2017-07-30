#!/usr/bin/env bash
echo 'should execute in project root direction,like ./script/**.sh'
git add *
git commit -m "1.服务器申请好，域名绑定IP 2.服务器所需软件装好 3.common.js实现优化 4.unread逻辑优化"
git push
git status