#!/usr/bin/env bash
echo 'should execute in project root direction,like ./script/**.sh'
git add *
git commit -m "1.增加微信商户公众号的信息 2.test时supervisor会造成内存溢出 3.增加db的脚本 4.完善流程"
git push
git status