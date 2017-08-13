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
    prompt = input('私密信息已加密？(y/n)\n')

    if prompt == 'y':
        execute_command_with_check('git status')
        execute_command_with_check('git add *')
        commit_msg = input('请输入commit log:\n')
        execute_command_with_check('git commit -m "%s%s' % (commit_msg, '"'))
        execute_command_with_check('git push')
        execute_command_with_check('git status')
        print('ok')
    else:
        print('请加密之后再提交')


def clear_project():
    execute_command_with_check('rm -rf node_modules/')
    execute_command_with_check('rm -rf dist/')


def update_project():
    execute_command_with_check('git pull')


def kill_project_port_process():
    execute_command_with_check('kill -9 $(lsof -t -i:8080)')


def start_process():
    clear_project()
    kill_project_port_process()
    execute_command_with_check('npm run build')
    execute_command_with_check('npm run start')


def connect_db():
    user_name = input()
    password = input()
    execute_command_with_check('mysql -u %s -p %s' % (user_name, password))


if __name__ == '__main__':
    cur_path = os.getcwd()
    parent_path = os.path.dirname(cur_path)
    os.chdir(parent_path)

    print('操作选项')
    print('1.git_commit_push'
          , '2.clear_project'
          , '3.update_project'
          , '4.kill_project_port_process'
          , '5.start_process'
          , '6.connect_db', sep='\n')

    menuNo = input()
    menuNo = int(menuNo)
    if menuNo == 1:
        git_commit_push()
    elif menuNo == 2:
        clear_project()
    elif menuNo == 3:
        update_project()
    elif menuNo == 4:
        kill_project_port_process()
    elif menuNo == 5:
        start_process()
    elif menuNo == 6:
        connect_db()
    else:
        print('没有这个选项')
