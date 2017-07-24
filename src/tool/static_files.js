import mime from 'mime';
import fs from 'mz/fs'; // 与Node.js的fs功能相同,封装成Promise
import path from 'path';

export default (url, dir) => {
  return async (ctx, next) => {
    let requestPath = ctx.request.path;
    if (requestPath.startsWith(url)) {
      let filePath = path.join(dir, requestPath.substring(url.length));
      if (await fs.exists(filePath)) {
        ctx.response.type = mime.lookup(requestPath);
        ctx.response.body = await fs.readFile(filePath);
      } else {
        ctx.response.status = 404;
      }
    } else {
      await next();
    }
  };
};
