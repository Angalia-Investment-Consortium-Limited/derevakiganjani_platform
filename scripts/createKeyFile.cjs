const fs = require('fs');
const path = require('path');

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPwq/rCNOcgg4r
abHy7Udglu+5umtEwM+ZCs9WJ6e3UlrVWpgqogh4l4wVo+ICqyqVJnVBhWL10Y7t
9OqmL/uI803ERxN6apCoOktcKKQmqiCggonGbjGeYEeolyXXyJZxnTWMi3qhqG6n
ScBG7I+jBSAcl6tPjneSL82W6Ijlru4s4bxk92t+jFeIijmlHKFKdBm07TsTL2R9
eIL/IhU8oM73GvikiHiO+YivEuPs/LlcwJIr6JTouO0X9sCoWSiGl20UqNCcEVZ0
jDLDTzMjdQeejXBBMZSah1Gcv7WbuOV7Tay1hfdKo/LS8zGmwAx/5H1Gm4W6Fcj6
v7qNP8aNAgMBAAECggEAC+9+Vb1TEtmx4LKYw4D4KcdiDER2ZyPAiWVClgt/Khv0
Fe+3cDOQ0wS5yoB4uniE4L6t287C6aZZVLhORq/Y/nwjypPevZijqNZ4f9nh3ErH
DYw2qPNS8IztmoFeZzJiHG8sUMjX70pG2rOyfZ9J6Vwq6/67kei2ptoC7JtpAk
pQBBTw3F43wziO0eYXHAzIBeX9lfxXJQuH8nzPrT/tXLHcMx38i23QVOZmKLiIsr-untvnCmPMGMNUDqnDgH/WbGH7WdGGHr4m8y3gc9PaN4TZVj54dCwo7JxU0iPia3
RCyqhdjw3bRHiTBODL8/yZMjbeeADrCV8SRHfvS3DQKBgQDoPjHmGXaPwQAt50hh
3m4eu+kh8o+26ZbAJQgQQDU9J0LgHw/bcmTBnHHoekqZ3qILUMWG8D7635bvFjbq
YMQqlDj86m239+sFvLjPBf5lYVnbJTTiq32KC9q5OI4xPBObC2R5Naeh6csNxp3R
Xu//BCx0y3cAEB1S6WxHrv3AgwKBgQDlA10z1am6Iixsu2QF+WWI/74btq/znjOF
wrkurIYbFMTyv/O/ovh+djlV10sd2n6Mc50qnxyrr81oxaIzWuq4FjfZdLPvpAM2
PnMWr6Q3BbZo2YLhbYHXcAoQzcuxKakjWQBXBpo46aSFwXtv2Qdul3c74dHGczDr
/S87b8CPrwKBgFrK/cz8BWrbxAsuEREZ2Skww0qfPmn+1g2WLJnV0DpxH+bondVn
2lYKqEl/jayr6ePMlvxS7fw77xDXOW7Vl7shqUnPCEfUp0/d4M4mhLbzoSJYYF2B
N5oBWmfw4T4EQ5HomUX9oORetyBSlp4kpGSpKAwdAw/GPQCN+uPnWJKrAoGBAMIr
ngRq7iMhAmWWZHIkSJBltbwtovV9dtW8ieIm6PVhILNpSLN87A/dETPU/J1tOcq/
48vVaCuxPQnON34vYb9/Jw86wa03dHmzbUUY2rTEJSq08SFNBb+yAPbKZh/p4LxV\no9IliPEkOBgoOg5VBtYfmjqtdn06AYq0+iz8zVmFAoGBAIap9YsO3z/3wh9Ayw9/
0JQG4+OCv0XJxNmXkLdAS7GUOdlk+SLdugyUumxluaOPbAk65TNZSZOXjgcFrq2+\nEcFJoh+DYI8W7C1802WF89gm+Nqv/DBjseVDkG2YqMSdvVUgQ3i3wOSDjlT9e39/
YMLZCG0rT0cqtOzvFVQCv8RY
-----END PRIVATE KEY-----\n`;

const serviceAccount = {
  "type": "service_account",
  "project_id": "derevakiganjani",
  "private_key_id": "bdf8e6838af0fb03a09725693da1b9d713cb1de4",
  "private_key": privateKey.replace(/\n/g, '\\n'),
  "client_email": "firebase-adminsdk-fbsvc@derevakiganjani.iam.gserviceaccount.com",
  "client_id": "115819045891150796115",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40derevakiganjani.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

const jsonString = JSON.stringify(serviceAccount, null, 2);
fs.writeFileSync(path.join(__dirname, 'serviceAccountKey.json'), jsonString);

console.log('serviceAccountKey.json created successfully.');