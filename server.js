// Setup basic express server
const express = require('express');
const session = require('express-session')
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const app =  express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const redis = require('redis').createClient();

var jsonParser = bodyParser.json()

// rds = redis data structure
var rds_chat = "chat";
var rds_room_details = "room";

function init(redis, socket){

    //Init
    console.log('Conexión detectada');

    var responseObj = [];
    redis.lrange(rds_chat, 0, -1, function(err, records){
        if(!err){
            for(id in records){
                var record = JSON.parse(records[id]);
                record['id'] = id;
                responseObj.push(record);
            }
            //console.log(responseObj);
            socket.emit('init', responseObj);
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
            date: new Date(),
            toString: function(){
                return require('util').format("[%s] %s - @%s: %s (%d/%d)",
                this.date, this.pregunta, this.twitter, this.mssge, this.likes, this.dislikes);
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
    secret: 'ym-M5urze8sxLK49-rMQ_#W#Z@3xNLNET__=Xncsm67UA&PFs^',
    saveUninitialized: true,
    resave: false,
    cookie:
        { maxAge: 1000 * 60 * 60 * 24} // 1 day expiration
    }))

// Routing
app.use(express.static(__dirname + '/public'));

app.use(fileUpload({
    limits: {filesize: 10 * 2014 * 1024}, //limiting files to 10MB
}));

app.set('view engine', 'ejs');

// POST method route
app.post('/chat', function (req, res, next) {

    if (req.files || Object.keys(req.files).length > 0) {
    
        let file1 = req.files.file1;
        let file2 = req.files.file2;

        file1.mv(__dirname+'/uploads/'+ req.files.file1.name, function(err) {
            if (err)
                return res.send("error here: \n"+ err);
              
        });
        
        file2.mv(__dirname+'/uploads/'+ req.files.file2.name, function(err) {
            if (err)
                return res.send("error here: \n"+ err);
              
                res.render('chat',
                    {data: 
                        {
                        eventName:req.body.eventName, 
                        username:req.body.username,
                        presenterContact:req.body.presenterContact,
                        file1:req.files.file1,
                        file2:req.files.file2
                }});
        }); 
    }
});

app.get('/download/:id', function(req,res,next){
    //console.log('Request Id:', req.params.id);
    res.download(__dirname + '/uploads/' + req.params.id, req.params.id);
});

server.listen(3001, "0.0.0.0", function(){
    console.log('Server listen on port http://0.0.0.0:3001');
})
