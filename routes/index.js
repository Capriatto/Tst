const express = require('express');
var router = express.Router();

// POST method route
router.post('/chat', function (req, res, next) {
    req.session.eventName = req.body.eventName;
    req.session.username = req.body.username;
    req.session.presenterContact = req.body.presenterContact;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.redirect('/chat');
    }

    let file1 = req.files.file1;
    let file2 = req.files.file2;
    let file3 = req.files.file3;

    if (file1){
        req.session.file1 = req.files.file1;
        file1.mv(__dirname+'/../uploads/'+ req.files.file1.name, function(err) {
            if (err)
                return res.send("error here: \n"+ err);
    });}
    
    
    if (file2){
        req.session.file2 = req.files.file2;
        file2.mv(__dirname+'/../uploads/'+ req.files.file2.name, function(err) {
            if (err)
                return res.send("error here: \n"+ err);
    });}
    
    
    if (file3){
        req.session.file3 = req.files.file3;
        file3.mv(__dirname+'/../uploads/'+ req.files.file3.name, function(err) {
            if (err)
                return res.send("error here: \n"+ err);
    });}
    
    return res.redirect('/chat');
});

router.get('/chat', function(req, res, next) {
    //para poder hacer render tengo que mandar los siguientes datos para acá, eventname, username, presentercontact ...
    console.log('aha!');
    res.render('chat',
                {data: 
                    {
                    eventName:req.session.eventName, 
                    username:req.session.username,
                    presenterContact:req.session.presenterContact,
                    file1:req.session.file1,
                    file2:req.session.file2,
                    file3:req.session.file3
            }});
});

router.get('/download/:id', function(req,res,next){
    res.download(__dirname + '/../uploads/' + req.params.id, req.params.id);
});

// route for handling 404 requests(unavailable routes)
router.use(function (req, res, next) {
    res.status(404).send(
        "<h1 style='text-align:center;margin:5% auto;color:darkgrey;\
        font-size:5em;'>Oops, parece que estás perdid@!</h1>");
  });


module.exports = router;