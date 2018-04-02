
var jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectID;
var User = require('../models/user');
var Username = require('../models/username');
var FingerPrint = require('../models/fingerprint');
var Station = require('../models/station');
var Provider = require('../models/provider')
var config = require('../../configs');

exports.get_finger_print = function(req, res, next){
    var station_key = req.headers['x-station-key'];
    var provider_key =  req.headers['x-provider-key'];
    if(station_key && provider_key){
        try{
            query_dict = {
                "_id":ObjectId(station_key),
                "provider":ObjectId(provider_key)
            };
            Station.findOne(query_dict, (err, station)=>{
                if(err || !station){
                    return res.status(404).send({error: 'Station key not found.'});
                }
                FingerPrint.find({}, { finger_print: 1, user: 1, updatedAt:1, _id:0}, (error, finger_prints)=>{
                    if(error){
                        return res.status(500).send({error: error.message});
                    }
                    return res.status(200).send({message:{ fingerprint : finger_prints}});
                })

            });
        }catch(e){
            return res.status(500).send({error: e.message});
        }
    }else{
        return res.status(400).send({error: 'Missing require header(s).'});
    }
}

exports.finger_print_login = function(req, res, next){
    var station_key = req.headers['x-station-key'];
    var provider_key =  req.headers['x-provider-key'];
    var user_key = req.headers['x-user-key']
    if(station_key && user_key && provider_key){
        try{
            query_dict = {
                "_id":ObjectId(station_key),
                "provider":ObjectId(provider_key)
            };
            Station.findOne(query_dict, (err, station)=>{
                if(err || !station){
                    return res.status(404).send({error: 'Station key not found.'});
                }
                User.find({'_id': ObjectId(user_key)},{id_card:1, firsttime:1, first_time_key:1}, (error, user)=>{
                    if(error){
                        return res.status(404).send({error: error.message});
                    }
                    if(user.length == 0){
                        return res.status(404).send({error: "Cannot find user"});
                    }

                    res.status(200).json({
                        token: 'JWT ' + generateToken(user),
                        user: user
                    });
                })

            });
        }catch(err){

        }
    }else{
        return res.status(400).send({error: 'Missing require header(s).'});
    }
}

exports.register_finger_print = function(req, res, next){ // register FINGER_PRINT
    var info = req.body;
    var station_key = req.headers['x-station-key'];
    var provider_key =  req.headers['x-provider-key'];

    if(station_key && provider_key){
        try{
            query_dict = {
                "_id":ObjectId(station_key),
                "provider":ObjectId(provider_key)
            };
            Station.findOne(query_dict, (err, station)=>{
                if(err){
                    res.status(500).send({err:'MongoDB cannot find this user'});
                    return next(err);
                }
                if(station && station.active){
                    if(info.fingerPrint && info.userId){
                        User.findOne({"_id":ObjectId(info.userId)}, (err, existed)=>{
                            if(err){
                                res.status(500).send({err:'MongoDB cannot find this user'});
                                return next(err);
                            }
                            if(existed){
                                var finger_print = new FingerPrint({
                                    finger_print: info.fingerPrint,
                                    user: existed._id
                                })
                                finger_print.save((err, user)=>{

                                    if(err){
                                        res.status(400).send({error: err.message});
                                        return next(err);
                                    }
                                    res.status(201).send({error:false});
                                });
                            }else{
                                return res.status(404).send({error: 'Cannot find user'});
                            }
                        })
                    }else{
                        return res.status(400).send({error : 'Missing field in json'});
                    }
                }else{
                    return res.status(404).send({error: 'Cannot find station'});
                }
            })
        }catch(e){
            return res.status(500).send({error: e.message});
        }
    }else{
        return res.status(400).send({error: 'Missing require header(s).'});
    }
}


function generateToken(user){
    info = {
        _id: user._id,
        thaiFullName : user.thaiFullName,
        engFullName : user.engFullName
    }
    return jwt.sign(info, config.secret, {
        expiresIn: 6000
    });
}