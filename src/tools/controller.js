import fs from 'fs';
import path from 'path';

const fileList = [];

// mvc rest
const walk = dir => {
  let dirList = fs.readdirSync(dir);
  dirList.forEach(item => {
    if (fs.statSync(path.join(dir, item)).isDirectory()) {
      walk(path.join(dir, item));
    } else {
      fileList.push(path.join(dir, item));
    }
  });
};

const addControllers = (router, dir) => {

  walk(path.join(__dirname, dir));

  fileList.filter(f => f.endsWith('.js')).forEach(f => {
    console.log(`process controller: ${f.replace(path.join(__dirname, dir), '')}`);
    addMapping(router, require(f));
  });
};

const addMapping = (router, mapping) => {
  for (let url in mapping) {
    if (url.startsWith('GET ')) {
      let path = url.substring(4);
      router.get(path, mapping[url]);
      console.log(`register URL mapping: GET ${path}`);
    } else if (url.startsWith('POST ')) {
      let path = url.substring(5);
      router.post(path, mapping[url]);
      console.log(`register URL mapping: POST ${path}`);
    } else if (url.startsWith('PUT ')) {
      let path = url.substring(4);
      router.put(path, mapping[url]);
      console.log(`register URL mapping: PUT ${path}`);
    } else if (url.startsWith('DELETE ')) {
      let path = url.substring(7);
      router.del(path, mapping[url]);
      console.log(`register URL mapping: DELETE ${path}`);
    } else if (url.startsWith('ALL ')) {
      let path = url.substring(4);
      router.all(path, mapping[url]);
      console.log(`register URL mapping: ALL ${path}`);
    } else {
      console.log('invalid URL: ${url}');
    }
  }
};

export default (dir = '../controllers') => {
  let router = require('koa-router')();
  addControllers(router, dir);
  return router.routes();
};