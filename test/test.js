const sockets = require('socket.io');
const jsdom = require("jsdom");
const { window } = new jsdom.JSDOM(`...`);
global.$ = require("jquery")(window);


var requ = require('../functions')


