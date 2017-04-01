import sha1 from 'sha1';
import {User} from './model';
import {session} from './config';

const cookie2user = async cookie => {
  if (cookie) {
    let cookieElements = cookie.split('-');
    if (cookieElements.length === 3) {
      // auth maxAge
      let [id, expires, sha1Str] = cookieElements;
      if (expires > Math.round(Date.now() / 1000)) {
        let user = await User.findByPrimary(id);
        if (user) {
          if (sha1Str === sha1(`${user.id}-${user.password}-${expires}-${session.cookieName}`)) {
            return user;
          }
        }
      }
    }
  }
};

//build cookieName string by: id-expires-sha1
const user2cookie = (id, password) => {
  let expires = Math.round(Date.now() / 1000 + session.maxAge);
  return `${id}-${expires}-` + sha1(`${id}-${password}-${expires}-${session.cookieName}`);
};

export {
  cookie2user, user2cookie
};