// Setup basic express server
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const socket = require('socket.io');
const app =  express();
const server = require('http').Server(app);
const io = socket(server);
const redis = require('redis').createClient();
const routes = require('./express_modules/router');
const room = require('./express_modules/room');

var rds_chat = "chat";
var room_id = room.generate;


function init(redis, socket){

    //Init
    console.log('Conexión detectada');

    var responseObj = [], messagesOfRoom = [];
    redis.lrange(rds_chat, 0, -1, function(err, records){
        if(!err){
            for(id in records){
                var record = JSON.parse(records[id]);
                record['id'] = id;
                responseObj.push(record);
            }

            for (let i = 0; i < responseObj.length; i++){
                if(responseObj[i].room_id == room_id)
                    messagesOfRoom.push(responseObj[i]);
            }

            console.log(messagesOfRoom);
            socket.emit('init', messagesOfRoom);
            // emit the room_id
            socket.emit('room', room_id);
        }
    });
}

module.exports.init = init;


io.on('connection', function(socket){

    init(redis, socket);

    // Social events
    socket.on('like', function(id){
        redis.lrange(rds_chat, id, id, function(err, mensajes){

            console.log(id, mensajes);
            record = JSON.parse(mensajes[0]);

            record.likes += 1;
            redis.lset(rds_chat, id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    socket.on('unlike', function(id){
        redis.lrange(rds_chat, id, id, function(err, mensajes){

            record = JSON.parse(mensajes[0]);
            record.likes -= 1;
            redis.lset(rds_chat, id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    socket.on('dislike', function(id){
        redis.lrange(rds_chat, id, id, function(err, mensajes){

            record = JSON.parse(mensajes[0]);
            record.dislikes += 1;
            redis.lset(rds_chat, id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    socket.on('undislike', function(id){
        redis.lrange(rds_chat, id, id, function(err, mensajes){

            record = JSON.parse(mensajes[0]);
            record.dislikes -= 1;
            redis.lset(rds_chat, id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    //Get a message
    socket.on('message', function(twitter, mensaje, pregunta){

        record = {
            twitter: twitter,
            mssge: mensaje,
            pregunta: pregunta,
            likes: 0,
            dislikes: 0,
            room_id: room_id,
            date: new Date(),
            toString: function(){
                return require('util').format("[%s] %s %s- @%s: %s (%d/%d)",
                this.date, this.pregunta, this.room_id, this.twitter, this.mssge, this.likes, this.dislikes);
            }
        };

        console.log(record.toString());

        var res = redis.rpush(rds_chat, JSON.stringify(record), function(err, id){
            if (!err){
                record['id'] = id - 1;
                io.emit('message', record);
            }
        });

    });

    //Disconect
    socket.on('disconnect', function(){
        console.log('Desconexión detectada');
    });

});

app.use(bodyParser.json());

// Use the session middleware
app.use(session({
    key: 'user_sid',
    secret: 'ym-M5urze8sxLK49-rMQ_#W#Z@3xNLNET__=Xncsm67UA&PFs^',
    saveUninitialized: true,
    resave: false,
    cookie:
        { maxAge: 1000 * 60 * 60 * 24} // 1 day expiration
    }));

app.use(fileUpload({
    limits: {filesize: 10 * 2014 * 1024} //limiting files to 10MB
}));

app.use(cookieParser());

// caching disabled for every route
app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});
  
app.set('view engine', 'ejs');

app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/less', express.static(__dirname + '/public/less'));
app.use('/scss', express.static(__dirname + '/public/scss'));

// routes
app.use('/', routes);

server.listen(3001, "0.0.0.0", function(){
    console.log('Server listen on port http://0.0.0.0:3001');
})