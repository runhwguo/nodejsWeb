const getRandomInt = (min = 0, max = 9) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getToday = (isFormatTwoNum = true, connector = '-') => {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();
  if (isFormatTwoNum) {
    if (dd < 10) {
      dd = '0' + dd
    }

    if (mm < 10) {
      mm = '0' + mm
    }
  }

  today = yyyy + connector + mm + connector + dd;
  return today;
};

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

export {
  getRandomInt, getToday, randomString
};