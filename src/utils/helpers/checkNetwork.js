const http = require('http')

module.exports = checkInternetConnection = () => {
    return new Promise((resolve) => {
      http.get('http://www.google.com', (res) => {
        resolve(true);
      }).on('error', (err) => {
        resolve(false);
      });
    });
};