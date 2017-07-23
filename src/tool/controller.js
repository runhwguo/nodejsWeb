import fs from 'fs';
import path from 'path';
import router from 'koa-router';

let _fileList = [];

const REQUEST_METHOD = ['GET', 'POST', 'PUT', 'DELETE', 'ALL'];

// mvc rest
const walk = dir => {
  let dirList = fs.readdirSync(dir);
  dirList.forEach(item => {
    if (fs.statSync(path.join(dir, item)).isDirectory()) {
      walk(path.join(dir, item));
    } else {
      _fileList.push(path.join(dir, item));
    }
  });
};

const addControllers = (router, dir) => {

  walk(path.join(__dirname, dir));

  _fileList.filter(f => f.endsWith('.js')).forEach(f => {
    let relativePath = f.replace(path.join(__dirname, dir), '');
    console.log(`process controller: ${relativePath}`);
    addMapping(router, require(f), relativePath.startsWith(path.sep + 'rest'), f.substring(f.lastIndexOf(path.sep), f.lastIndexOf('.js')));
  });

  _fileList = [];
};

const addMapping = (router, mapping, isRestfulApi, restPrefixPath) => {
  for (let url in mapping) {
    let [method, path] = url.split(' ');
    if (method && path && REQUEST_METHOD.includes(method)) {
      if (isRestfulApi) {
        path = '/api' + restPrefixPath + path;
      }
      router[method.toLowerCase()](path, mapping[url]);
      console.log(`register URL mapping: ${method} ${path}`);
    } else {
      console.log('invalid URL: ${url}');
    }
  }
};

export default (dir = '../controller') => {
  addControllers(router(), dir);
  return router().routes();
};