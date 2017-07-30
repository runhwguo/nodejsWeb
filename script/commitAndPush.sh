#!/usr/bin/env bash
echo 'should execute in project root direction,like ./script/**.sh'
git add *
git commit -m "1.进入首页，不需要出发login的逻辑，优化！2.test阶段会memory out 有待观察"
git push
git status