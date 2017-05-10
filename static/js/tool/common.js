/**
 * 生成随机字符串，默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
 * @param len
 * @returns {string}
 */
const randomString = (len = 32) => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let maxPos = chars.length;
  let pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += chars[Math.floor(Math.random() * maxPos)];
  }
  return pwd;
};