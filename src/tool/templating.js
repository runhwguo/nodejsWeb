import {Environment, FileSystemLoader} from 'nunjucks';

const createEnv = (opts, path = 'dist/view') => {
  let autoescape       = opts.autoescape && true,
      noCache          = opts.noCache || false,
      watch            = opts.watch || false,
      throwOnUndefined = opts.throwOnUndefined || false,
      env              = new Environment(
        // 创建一个文件系统加载器，从views目录读取模板
        new FileSystemLoader(path, {
          noCache: noCache,
          watch: watch,
        }), {
          autoescape: autoescape,
          throwOnUndefined: throwOnUndefined,
          tags: {
            blockStart: '',
            blockEnd: '',
            variableStart: '',
            variableEnd: '',
            commentStart: '',
            commentEnd: ''
          }
        });
  if (opts.filters) {
    for (let f in opts.filters) {
      env.addFilter(f, opts.filters[f]);
    }
  }
  return env;
};

const templating = (opts, path) => {
  // 创建Nunjucks的env对象:
  let env = createEnv(opts, path);
  return async (ctx, next) => {
    // 给ctx绑定render函数:
    ctx.render = (view, model) => {
      // 把render后的内容赋值给response.body: 为了扩展 将多个对象的属性复制到一个对象中
      ctx.response.body = env.render(`${view}.html`, Object.assign({}, ctx.state || {}, model || {}));
      // 设置Content-Type:
      ctx.response.type = 'text/html';
    };
    // 继续处理请求:
    await next();
  };
};

export default templating;