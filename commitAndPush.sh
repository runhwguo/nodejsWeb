#!/usr/bin/env bash
git add *
git commit -m "fix bug: 下架任务不需要删除，只需要改变状态"
git push
git status