#!/usr/bin/env python3

import os
import re
import warnings

WANT_ENCODE_FILE_EXTENSION = ['js', 'txt']
SRC_DIR = 'src'
DOC_DIR = 'doc'
SCRIPT_DIR = 'script'


def _dir_encrypted(_dir):
    for root, dirs, files in os.walk(_dir):
        for name in files:
            ext = os.path.splitext(name)[1][1:]
            if len(ext) > 0 and ext in WANT_ENCODE_FILE_EXTENSION:
                file_name = root + os.path.sep + name
                with open(file_name, 'r') as file:
                    data = file.read()
                    if not _is_base64(data):
                        print(file_name, '是明文源代码')
                        return False
    return True


def _dir_decrypted(_dir):
    for root, dirs, files in os.walk(_dir):
        for name in files:
            ext = os.path.splitext(name)[1][1:]
            if len(ext) > 0 and ext in WANT_ENCODE_FILE_EXTENSION:
                file_name = root + os.path.sep + name
                with open(file_name, 'r') as file:
                    data = file.read()
                    if _is_base64(data):
                        print(file_name, '是加密过的')
                        return False
    return True


def _is_base64(s):
    return (len(s) % 4 == 0) and re.match('^[A-Za-z0-9+/]+[=]{0,2}$', s)


def execute_command_with_check(command):
    result = os.system(command)
    if result != 0:
        print(command + " fail, result = ", result)
    else:
        print(command + ' ok')


def git_commit_push():
    prompt = input('私密信息已加密？(y/n)\n')

    if prompt == 'y':
        if not _dir_encrypted(SRC_DIR):
            print('检测到src目录下存在没有加密的文件')
            return
        if not _dir_encrypted(DOC_DIR):
            print('检测到doc目录下存在没有加密的文件')
            return

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
    execute_command_with_check('npm run clean')


def update_project():
    execute_command_with_check('git pull')


def kill_project_port_process():
    execute_command_with_check('kill -9 $(lsof -t -i:8080)')


def start_process():
    prompt = input('代码是否都解密还原？(y/n)\n')

    if prompt == 'y':
        if not _dir_decrypted(SRC_DIR):
            print('检测到src目录下存在非明文的源代码文件')
            return
        prompt = input('test or production (t/p)\n')
        if prompt == 't':
            cmd = 'test'
        elif prompt == 'p':
            cmd = 'start'
        else:
            print('输入错误 return')
            return
        clear_project()
        kill_project_port_process()
        execute_command_with_check('npm %s' % cmd)
        warnings.warn('this only test encode/decode, please use pm2 to start process')
    else:
        warnings.warn('请解密还原后，再start')


def connect_db():
    user_name = input('username:')
    password = input('password:')
    execute_command_with_check('mysql -u %s -p %s' % (user_name, password))


def run_security_operation():
    os.chdir(cur_path)
    execute_command_with_check('java -jar GeneratePasswordWithOneKey.jar')


def init_db():
    init_db_file = os.path.join(SRC_DIR, 'tool', 'init_db.js')
    execute_command_with_check('node %s' % init_db_file)


if __name__ == '__main__':
    cur_path = os.getcwd()
    root_path = os.path.dirname(cur_path)
    if cur_path.endswith(SCRIPT_DIR):
        os.chdir(root_path)

        print('操作选项')
        print('1.git_commit_push'
              , '2.clear_project'
              , '3.update_project'
              , '4.kill_project_port_process'
              , '5.start_process'
              , '6.connect_db'
              , '7.run_security_operation'
              , '8.init_db', sep='\n')

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
        elif menuNo == 7:
            run_security_operation()
        elif menuNo == 8:
            init_db()
        else:
            print('没有这个选项')
    else:
        print('请在%s下，运行%s' % (SCRIPT_DIR, __file__))
