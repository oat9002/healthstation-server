var Provider = require('../provider/models');
var Username = require('../user/models/username');
var ObjectId = require('mongodb').ObjectID;

exports.provider_register = function(req, res, next){
    var body = req.body;
    if(body.name && body.address && body.phone && body.username && body.password && body.email && body.fax){
        try{
            var username = new Username({
                username : body.username
            });
            Username.findOne({"username": body.username}, function(err, existed_username){
                if(err){
                    res.status(500).send({error:true, message: 'Inter server error'});
                }
                if(existed_username){
                    res.status(409).send({error:true, message: 'Already existed username'});
                    return next(err);
                }else{
                    var provider = new Provider({
                        name: body.name,
                        address: body.address,
                        phone: body.phone,
                        fax: body.fax,
                        email: body.email,
                        created_time: Date.now(),
                        authentication:{
                            username : body.username,
                            password : body.password
                        }
                    });
                    provider.save(function(err, user){
                        if(err){
                            res.status(400).send({error: true, message: err.message});
                            return next(err);
                        }else{
                            username.save();
                            res.status(201).send({key:user._id});
                        }
                    });
                }
            })
        }catch(e){
            return res.status(500).send({error: e.message});
        }
    }else{
        return res.status(406).send({error : 'Missing require field in body'});
    }
}