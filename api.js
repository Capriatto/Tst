module.exports = function(express, redis, io){


    var router = express.Router();

    router.use('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });

    router.get('/mensajes', function(req, res){
        var responseObj = [];
        redis.lrange('MENSAJES', 0, -1, function(err, records){
            if(!err){
                for(id in records){
                    var record = JSON.parse(records[id]);
                    record['id'] = id;
                    responseObj.push(record);
                }
                res.status(200).json({success: true, data: responseObj});
            }
        });
    });

    router.post('/mensajes/:id', function(req, res){
        console.log(req.params);
        io.emit('active', {id: req.params.id});
        res.status(200).json({success:true})
    });

    return router;

}
