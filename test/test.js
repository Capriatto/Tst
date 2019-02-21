const sockets = require('socket.io');
global.io = require('socket.io');
global.document = require('jsdom');

const jsdom = require("jsdom");
const { window } = new jsdom.JSDOM(`...`);
global.$ = require("jquery")(window);


var io = require('socket.io-client');
moment = require('moment');
should = require('should');
var expect = require('chai').expect;
const functions = require('../public/js/functions');

describe('Timer tests:', function(){
  it('Testing the time is not empty', function(){
    expect(functions.fecha('2019-02-12T06:50:19.679Z')).to.not.be.empty;
  });
});

describe('Likes:', function(){

  it('Testing likes are never null', function(){
    expect(functions.like(1)).not.to.be.null;
  });
});

describe('Dislikes:', function(){

  it('Testing Dislikes are never null', function(){
    expect(functions.dislike(1)).not.to.be.null;
  });
});

