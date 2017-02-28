let superagent = require('superagent');
const STU_INFO = 'http://stu.ujs.edu.cn/mobile/rsbulid/r_3_3_st_jbxg.aspx';

let iPlanetDirectoryProCookie = 'iPlanetDirectoryPro=AQIC5wM2LY4SfcxfptudxQZ790szMWDZYbdh8UwvPzYo0zM%3D%40AAJTSQACMDE%3D%23';
superagent
    .get(STU_INFO)
    .set('Host', 'stu.ujs.edu.cn')
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    .set('Accept-Language', 'zh-CN,zh;q=0.8,en;q=0.6')
    .set('Accept-Encoding', 'gzip, deflate, sdch')
    .set('Cache-Control', 'no-cache')
    .set('Connection', 'keep-alive')
    .set('Pragma', 'no-cache')
    .set('Upgrade-Insecure-Requests', 1)
    .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
    .set('Cookie', iPlanetDirectoryProCookie)
    .end((error, response) => {
        // const ASP_NET_SessionId = response.header['set-cookie'][0].split(';')[0];
        const ASP_NET_SessionId = response.header['set-cookie'][0].split(';')[0];

        superagent
            .get(STU_INFO)
            .set('Cookie', ASP_NET_SessionId)
            .end((error, reponse) => {
                console.log(reponse.text);
            });
    });
