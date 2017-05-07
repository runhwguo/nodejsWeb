import fs from "fs";
import path from "path";

let fileList = [];

const REQUEST_METHOD = {
  GET: 'GET ',
  POST: 'POST ',
  PUT: 'PUT ',
  DELETE: 'DELETE ',
  ALL: 'ALL '
};

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

  fileList = [];
};

const addMapping = (router, mapping) => {
  for (let url in mapping) {
    if (url.startsWith(REQUEST_METHOD.GET)) {
      let path = url.substring(REQUEST_METHOD.GET.length);
      router.get(path, mapping[url]);
      console.log(`register URL mapping: GET ${path}`);
    } else if (url.startsWith(REQUEST_METHOD.POST)) {
      let path = url.substring(REQUEST_METHOD.POST.length);
      router.post(path, mapping[url]);
      console.log(`register URL mapping: POST ${path}`);
    } else if (url.startsWith(REQUEST_METHOD.PUT)) {
      let path = url.substring(REQUEST_METHOD.PUT.length);
      router.put(path, mapping[url]);
      console.log(`register URL mapping: PUT ${path}`);
    } else if (url.startsWith(REQUEST_METHOD.DELETE)) {
      let path = url.substring(REQUEST_METHOD.DELETE.length);
      router.del(path, mapping[url]);
      console.log(`register URL mapping: DELETE ${path}`);
    } else if (url.startsWith(REQUEST_METHOD.ALL)) {
      let path = url.substring(REQUEST_METHOD.ALL.length);
      router.all(path, mapping[url]);
      console.log(`register URL mapping: ALL ${path}`);
    } else {
      console.log('invalid URL: ${url}');
    }
  }
};

export default (dir = '../controller') => {
  let router = require('koa-router')();
  addControllers(router, dir);
  return router.routes();
};