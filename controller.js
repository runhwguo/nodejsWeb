const fs = require('fs'),
    path = require('path'),
    fileList = [];

// mvc rest
function walk(dir) {
    let dirList = fs.readdirSync(dir);
    dirList.forEach(item => {
        if (fs.statSync(path.join(dir, item)).isDirectory()) {
            walk(path.join(dir, item));
        } else {
            fileList.push(path.join(dir, item));
        }
    });
}

function addControllers(router, dir) {

    walk(path.join(__dirname, dir));

    fileList.filter(f => f.endsWith('.js')).forEach(f => {
        console.log(`process controller: ${f.replace(path.join(__dirname, dir), '')}`);
        addMapping(router, require(f));
    });
}

function addMapping(router, mapping) {
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
        } else {
            console.log('invalid URL: ${url}');
        }
    }
}

module.exports = dir => {
    let controllers_dir = dir || 'controllers',
        router = require('koa-router')();
    addControllers(router, controllers_dir);
    return router.routes();
};