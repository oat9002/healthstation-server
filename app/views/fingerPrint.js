
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
    if(station_key){
        Station.findOne({"_id": ObjectId(station_key)}, (err, station)=>{
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
    }else{
        return res.status(400).send({error: 'Missing require header(s).'});
    }
}

exports.finger_print_login = function(req, res, next){
    var station_key = req.headers['x-station-key'];
    var user_key = req.headers['x-user-key']
    if(station_key && user_key){
        Station.findOne({"_id": ObjectId(station_key)}, (err, station)=>{
            if(err || !station){
                return res.status(404).send({error: 'Station key not found.'});
            }
            console.log(user_key)
            User.find({'_id': ObjectId(user_key)},{id_card:1, about:1, role:1, firsttime:1}, (error, user)=>{
                if(error){
                    return res.status(500).send({error: error.message});
                }
                if(user.length == 0){
                    return res.status(500).send({error: "Cannot find user"});
                }
                console.log(user)

                res.status(200).json({
                    token: 'JWT ' + generateToken(user),
                    user: user
                });
            })

        });
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