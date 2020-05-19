const express = require('express');
const router = express.Router();
const redis = require('redis').createClient();
const room = require('./room');
const cookieParser = require('cookie-parser');

const rds_event = "event";

router.get('/',function(req, res, next) {
    if(req.cookies.io)
        return res.redirect('/chat/' + room.get);
    return res.render('index');
});

// POST method route
router.post('/chat', function (req, res, next) {

    record = {
        eventName: req.body.eventName,
        username: req.body.username,
        presenterContact: req.body.presenterContact,
        room: room.get,
        file1: '',
        file2: '',
        file3: '',
        presenter: req.session.id,
        date: new Date(),
    };

    var event_info = redis.rpush(rds_event, JSON.stringify(record), function(err, id){
        if (!err){
            record['id'] = id - 1;
        }
    });

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.redirect('/chat/' + room.get);
    }

    let file1 = req.files.file1;
    let file2 = req.files.file2;
    let file3 = req.files.file3;

    if (file1){
        record.file1= file1;
        redis.lset(rds_event, -1, JSON.stringify(record));
        file1.mv(__dirname+'/../uploads/'+ req.files.file1.name, function(err) {
            if (err)
                return res.send("error here: \n"+ err);
    });}
    
    
    if (file2){
        record.file2= file2;
        redis.lset(rds_event, -1, JSON.stringify(record));
        file2.mv(__dirname+'/../uploads/'+ req.files.file2.name, function(err) {
            if (err)
                return res.send("error here: \n"+ err);
    });}
    
    
    if (file3){
        record.file3= file3;
        redis.lset(rds_event, -1, JSON.stringify(record));
        file3.mv(__dirname+'/../uploads/'+ req.files.file3.name, function(err) {
            if (err)
                return res.send("error here: \n"+ err);
    });}
    
    return res.redirect('/chat/' + room.get);
});

router.get('/chat/:id', function(req, res, next) {
    if(req.params.id != room.get){
        return res.sendStatus(404);
    }

    var currentUser = req.session.id;
    var isPresenter = false;

    redis.lrange(rds_event, -1, -1, function(err, mensajes){
            record = JSON.parse(mensajes[0]);

            if (currentUser == record.presenter)
                isPresenter=true;
            
            res.render('chat',
                {data: 
                    {
                    eventName: record.eventName,
                    username:record.username,
                    presenterContact:record.presenterContact,
                    isPresenter : isPresenter,
                    room: record.room,
                    file1:record.file1,
                    file2:record.file2,
                    file3:record.file3
                }});
    });
});

router.get('/download/:id', function(req,res,next){
    res.download(__dirname + '/../uploads/' + req.params.id, req.params.id);
});

router.get('/logout', function(req,res,next){
    req.session.destroy((err) => {
        if(err)
            console.log("error => " + err);
    });
    res.clearCookie('io');
    res.clearCookie('user_sid');
    room.generate;
    return res.redirect('/');
});

// route for handling 404 requests(unavailable routes)
router.use(function (req, res, next) {
    res.sendStatus(404);
  });


module.exports = router;