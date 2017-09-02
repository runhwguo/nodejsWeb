#!/usr/bin/env python3

import os
import re
import jpype
from jpype import *
import warnings

WANT_ENCODE_FILE_EXTENSION = ['js', 'txt']
SRC_DIR = 'src'
DOC_DIR = 'doc'
SCRIPT_DIR = 'script'
ENCRYPTED, DECRYPTED = 'encrypted', 'decrypted'

cur_path = os.getcwd()
root_path = os.path.dirname(cur_path)

jvm_path = jpype.getDefaultJVMPath()
ext_classpath = os.path.join(cur_path, 'GeneratePasswordWithOneKey.jar')
jvm_arg = '-Djava.class.path=' + ext_classpath
jpype.startJVM(jvm_path, jvm_arg)


def _dir_walk(_dir, operator):
    """
    内部方法
        遍历目录
    :param _dir:
    :param operator:
    :return:
    """
    if operator not in [ENCRYPTED, DECRYPTED]:
        raise Exception('no this operator')

    for root, dirs, files in os.walk(_dir):
        for name in files:
            ext = os.path.splitext(name)[1][1:]
            if len(ext) > 0 and ext in WANT_ENCODE_FILE_EXTENSION:
                file_name = os.path.join(root, name)
                with open(file_name) as file:
                    data = file.read()
                    result = _is_base64(data)
                    if not result and operator == ENCRYPTED:
                        print(file_name, '是明文源代码')
                        return False
                    if result and operator == DECRYPTED:
                        print(file_name, '是加密过的')
                        return False
    return True


def _is_base64(s):
    """
    内部方法
        检查string是否是base64编码
    :param s:
    :return:
    """
    return (len(s) % 4 == 0) and re.match('^[A-Za-z0-9+/]+[=]{0,2}$', s)


def _execute_command_with_check(command):
    """
    内部方法
        Python封装的os的命令操作
    :param command:
    :return:
    """
    result = os.system(command)
    if result == 0:
        print(command + ' ok')
    else:
        print(command + " fail, result = ", result)
    return result == 0


def git_commit_push():
    """
    git 提交代码到github，做了是否加密检查，如果存在没有加密的文件，就直接return
    :return:
    """
    prompt = input('私密信息已加密？(y/n)\n')

    if prompt == 'y':
        if not _dir_walk(SRC_DIR, ENCRYPTED):
            print('检测到src目录下存在没有加密的文件')
            return
        if not _dir_walk(DOC_DIR, ENCRYPTED):
            print('检测到doc目录下存在没有加密的文件')
            return

        _execute_command_with_check('git status'
                                    ) and _execute_command_with_check('git add *')

        commit_msg = input('please input commit log:\n')

        _execute_command_with_check('git commit -m "%s%s' % (commit_msg, '"')
                                    ) and _execute_command_with_check('git push')

        _execute_command_with_check('git status')
        print('ok')

        print('如果是开发环境，在提交代码后，请自行再还原代码')
        prompt = input('是否启动解码程序? (y/n)')
        if prompt == 'y':
            run_security_operation(6)
        else:
            print('不启动')
    else:
        print('请加密之后再提交')


def clear_project():
    """
    清理项目
        执行package.json里定义的脚本clean
        具体delete [node_modules dist gulp-cache test.* *.log log logs]
    :return:
    """
    prompt = input('将删除log文件，确定？(y/n)\n')
    if prompt == 'y':
        _execute_command_with_check('npm run clean')
    else:
        print('再看看咯')


def update_project():
    """
    更新项目
        1.clear project
        2.执行git checkout . 会撤销所有需改 以防止代码冲突
        2.从github拉取最新代码
    :return:
    """
    clear_project()
    _execute_command_with_check('git checkout .'
                                ) and _execute_command_with_check('git pull')


def kill_project_port_process():
    """
    kill当前项目的进程
        防止一些情况下process没有结束
    :return:
    """
    _execute_command_with_check('kill -9 $(lsof -t -i:8080)')


def start_process():
    """
    start process 仅用于测试时 start项目，正式用pm2管理工具
        1.clear project
        2.kill project process
        3.npm test/start
    :return:
    """
    prompt = input('代码是否都解密还原？(y/n)\n')

    if prompt == 'y':
        if not _dir_walk(SRC_DIR, DECRYPTED):
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
        _execute_command_with_check('npm %s' % cmd)
        warnings.warn('this only test encode/decode, please use pm2 to start process')
    else:
        warnings.warn('请解密还原后，再start')


def connect_db():
    """
    连接数据库
        参数是username和password
    :return:
    """
    user_name = input('username:')
    password = input('password:')
    _execute_command_with_check('mysql -u %s -p%s' % (user_name, password))


def run_security_operation(menu=None):
    """
    执行java的加解密程序
    :return:
    """
    Main = jpype.JClass('Main')

    args = []
    if menu:
        args.append(str(menu))

    Main.main(args)


def init_db():
    """
    初始化数据库表
        1.数据库需要自己动手建立
    :return:
    """
    init_db_file = os.path.join(SRC_DIR, 'tool', 'init_db.js')
    prompt = input('test or production (t/p)\n')
    if prompt == 't':
        node_env = 'test'
    elif prompt == 'p':
        node_env = 'production'
    else:
        print('wrong input')
        return
    os.environ['NODE_ENV'] = node_env
    _execute_command_with_check('export'
                                ) and _execute_command_with_check('node %s' % init_db_file)


def other():
    """
    一些保留操作
    :return:
    """
    print(os.getcwd())


if __name__ == '__main__':
    if cur_path.endswith(SCRIPT_DIR):
        os.chdir(root_path)
        while True:
            print('操作选项(相对于项目根目录操作)')
            print('1.git_commit_push'
                  , '2.clear_project'
                  , '3.update_project'
                  , '4.kill_project_port_process'
                  , '5.start_process'
                  , '6.connect_db'
                  , '7.run_security_operation'
                  , '8.init_db'
                  , '9.other'
                  , '0.exit', sep='\n')

            menuNo = input()
            print(menuNo)
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
                break
            elif menuNo == 8:
                init_db()
            elif menuNo == 9:
                other()
            elif menuNo == 0:
                print('bye.')
                exit(0)
            else:
                print('没有这个选项')
    else:
        warnings.warn('请在%s下，运行%s' % (SCRIPT_DIR, __file__))
