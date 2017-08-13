#!/usr/bin/env python3

import os


def execute_command_with_check(command):
    print(os.getcwd())
    result = os.system(command)
    if result != 0:
        print(command + " fail, result = ", result)
    else:
        print(command + ' ok')


def git_commit_push():
    cur_path = os.getcwd()
    parent_path = os.path.dirname(cur_path)
    os.chdir(parent_path)

    execute_command_with_check('git status')
    execute_command_with_check('git add *')
    commit_msg = input('请输入commit log:\n')
    execute_command_with_check('git commit -m "%s%s' % (commit_msg, '"'))
    execute_command_with_check('git push')
    execute_command_with_check('git status')


if __name__ == '__main__':
    prompt = input('私密信息已加密？(y/n)\n')

    if prompt == 'y':
        git_commit_push()
        print('ok')
    else:
        print('请加密之后再提交')
