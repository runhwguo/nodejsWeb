#!/usr/bin/env bash
echo 'should execute in project script direction'
cd ..
git add *
git commit -m "1.vue 未渲染完成时，不显示代码 https://cn.vuejs.org/v2/api/index.html 2.接入pm2"
git push
git status
cd script