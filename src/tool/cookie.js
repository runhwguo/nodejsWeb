import sha1 from 'sha1';
import {admin, session} from './config';
import {User} from './model';

const cookie2user = async (cookie, cookieName) => {
  if (cookie) {
    let cookieElements = cookie.split('-');
    if (cookieElements.length === 3) {
      // auth maxAge
      let [id, expires, sha1Str] = cookieElements;
      if (expires > Math.round(Date.now() / 1000)) {
        if (cookieName === session.userCookieName) {
          let user = await User.findByPrimary(id, {
            attributes: ['id', 'password', 'headImgUrl', 'name', 'openId', 'qq', 'wx', 'tel']
          });

          user = user.dataValues;
          if (user) {
            if (sha1Str === sha1(`${user.id}-${user.password}-${expires}-${session.cookieKey}`)) {
              return user;
            }
          }
        } else if (cookieName === session.adminCookieName) {
          if (sha1Str === sha1(`${admin.username}-${admin.password}-${expires}-${session.cookieKey}`)) {
            return admin;
          }
        }
      }
    }
  }
};

//build cookieName string by: id-expires-sha1
const user2cookie = (id, password) => {
  let expires = Math.round(Date.now() / 1000 + session.maxAge);
  return `${id}-${expires}-` + sha1(`${id}-${password}-${expires}-${session.cookieKey}`);
};

export {
  cookie2user, user2cookie
};