import sha1 from 'sha1';
import {User} from './model';
import userDao from '../dao/user_dao';
import {session} from './config';

async function cookie2user(cookie) {
  if (cookie) {
    let cookieElements = cookie.split('-');
    if (cookieElements.length === 3) {
      // auth maxAge
      let [id, expires, sha1Str] = cookieElements;
      if (expires > Math.round(Date.now() / 1000)) {
        let user = await userDao.findById(id);
        if (user) {
          if (sha1Str === sha1(`${user.id}-${user.password}-${expires}-${session.cookieName}`)) {
            return user;
          }
        }
      }
    }
  }
}

//build cookieName string by: id-expires-sha1
function user2cookie(id, password) {
  let expires = Math.round(Date.now() / 1000 + session.maxAge);
  return `${id}-${expires}-` + sha1(`${id}-${password}-${expires}-${session.cookieName}`);
}


export {
  cookie2user, user2cookie
};