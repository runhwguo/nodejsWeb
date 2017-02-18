import sha1 from 'sha1';
import {User as User} from './model';
import config from './config';

async function cookie2user(cookie) {
    if (cookie) {
        let cookieElements = cookie.split('-');
        if (cookieElements.length === 3) {
            // auth maxAge
            let id = cookieElements[0],
                expires = cookieElements[1],
                sha1Str = cookieElements[2];
            if (expires > Math.round(new Date().getTime() / 1000)) {
                let user = await User.findById(id);
                if (user) {
                    if (sha1Str === sha1(`${user.id}-${user.password}-${expires}-${config.session.cookieName}`)) {
                        return user;
                    }
                }
            }
        }
    }
}

//build cookieName string by: id-expires-sha1
function user2cookie(id, password) {
    let expires = Math.round(new Date().getTime() / 1000 + config.session.maxAge);
    return `${id}-${expires}-` + sha1(`${id}-${password}-${expires}-${config.session.cookieName}`);
}


module.exports = {
    cookie2user: cookie2user,
    user2cookie: user2cookie
};