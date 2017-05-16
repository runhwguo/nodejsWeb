#!/usr/bin/env bash
git add *
git commit -m "新增dist目录，是压缩混淆代码资源的目录，其中font不用压缩，image是手动在网站上压缩的，gulp-image-min效果不理想"
git push
git status