var jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectID;
var User = require('../models/user');
var Username = require('../models/username');
var FingerPrint = require('../models/fingerprint');
var Station = require('../models/station');
var Provider = require('../models/provider')
var config = require('../../configs');
    rand = require('random-key');

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

exports.protected = function(req, res, next){
    res.status(200).json({
        role: req.user.role,
        firsttime: req.user.firsttime
    });
}

exports.login = function(req, res, next){
    var provider_key =  req.headers['x-provider-key'];
        station_key = req.headers['x-station-key'];
    query_dict = {
        "_id":ObjectId(station_key),
        "provider":ObjectId(provider_key)
    };
    Station.findOne(query_dict ,(err, result)=>{
        if(err){
            res.status(404).send({err:err.message});
                return next(err);
        }
        var userInfo = getInfoStationLogin(req.user);
        res.status(200).json({
            token: 'JWT ' + generateToken(userInfo),
            data: userInfo
        });
    })
}

exports.mobile_login = function(req, res, next){

    if(req.user.role==="patient"){
        var userInfo = setPatientInfo(req.user);
        res.status(200).json({
            token: 'JWT ' + generateToken(userInfo),
            user: userInfo
        });
    }else if(req.user.role==="doctor"){
        var userInfo = setDoctorInfo(req.user);
        res.status(200).json({
            token: 'JWT ' + generateToken(userInfo),
            user: userInfo
        });
    }
}

exports.register = function(req, res, next){ // register ID_CARD
    var info = req.body;
    var station_key = req.headers['x-station-key'];
    var provider_key =  req.headers['x-provider-key'];
    var idNumber = info.idNumber;
    if(!idNumber){
        return res.status(422).send({error: 'Missing Id number'});
    }
    if(station_key && provider_key){
        query_dict = {
            "_id":ObjectId(station_key),
            "provider":ObjectId(provider_key)
        };
        Station.findOne(query_dict, (err, station)=>{
            if(err){
                res.status(400).send({err:err.message});
                    return next(err);
            }

            if(station){

                if(info.thaiFullName && info.engFullName && info.birthOfDate && info.address && info.idNumber && info.gender){
                    User.findOne({"id_card.idNumber": idNumber}, function(err, existingUser){

                        if(err){
                            res.status(500).send({err:'MongoDB cannot find this user'});
                            return next(err);
                        }
                        if(existingUser){
                            res.status(409).send({error: 'this id number is already exist'});
                            return next(err);
                        }
                        birth_date = new Date(info.birthOfDate);
                        birth_date.setFullYear(birth_date.getFullYear()-543)
                        var user = new User({
                            id_card:{
                                thaiFullName : info.thaiFullName,
                                engFullName : info.engFullName,
                                birthOfDate : birth_date,
                                address : {
                                    title: info.address,
                                },
                                idNumber : info.idNumber,
                                gender: info.gender
                            },
                            authentication:{
                                username : info.idNumber,
                                password : ("0" + birth_date.getDate()).slice(-2)+""+("0" + (birth_date.getMonth() + 1)).slice(-2)+""+(birth_date.getFullYear()+543)
                            },
                            firsttime: true,
                            first_time_key: rand.generate(24),
                            role : info.role
                        });

                        user.save(function(err, user){
                            if(err){
                                res.status(502).send({error: 'MongoDB cannot connect'});
                                return next(err);
                            }
                            var userInfo = getInfoAfterRegister(user);
                            res.status(201).json({
                                token: 'JWT ' + generateToken(userInfo),
                                user: userInfo
                            })
                        });
                    })
                }else{
                    return res.status(400).send({error : 'Missing field in json'});
                }
            }else{
                return res.status(404).send({error: 'Cannot find station'});
            }
        })
    }else{
        return res.status(400).send({error: 'Missing require header(s).'});
    }
}

exports.firsttimeChanged = function(req, res, next){
    var info = req.body;
    var key = req.headers['x-user-key'];
    if(!key){
        return res.status(422).send({error: 'Missing require headers'});
    }
    if(info.username && info.password){
        User.findOne({"_id": ObjectId(key)}, function(err, existingUser){
            if(err){
                res.status(500).send({err:'MongoDB cannot find this user'});
                return next(err);
            }
            Username.findOne({'username': info.username}, (err, existed)=>{
                if(err){
                    res.status(400).send({error:true, message: err});
                    return next(err);
                }
                if(existed){
                    res.status(400).send({error:true, message: "Username's already existed"});
                    return next(err);
                }
                username =  new Username({
                    username : info.username
                });
                username.save((save_err, result)=>{
                    if(save_err){
                        res.status(400).send({error:true, message: save_err});
                        return next(save_err);
                    }
                    existingUser.authentication = {
                        username : info.username,
                        password : info.password
                    };
                    existingUser.firsttime = false;
                    existingUser.markModified('authentication');
                    existingUser.markModified('firsttime');
                    existingUser.save();
                    return res.status(200).send({err:false, message:'Update success'})
                });
            });
        });
    }else{
        return res.status(400).send({error:'Missing field in json'});
    }
}

exports.roleAuthorization = function(roles){ // manage user role
    return function(req, res, next){
        var user = req.user;

        User.findById(user._id, function(err, foundUser){

            if(err){
                res.status(422).json({error: 'No user found.'});
                return next(err);
            }

            if(roles.indexOf(foundUser.role) > -1){
                return next();
            }

            res.status(401).json({error: 'You are not authorized to view this content'});
            return next('Unauthorized');

        });

    }
}

exports.profileChanging = function(req, res, next){
    var info = req.body;
    var _id = req.headers['_id'];
    console.log(info);
    if(!_id){
        return res.status(422).send({error: 'Missing require headers'});
    }
    if(Object.keys(info).length == 0){
        return res.status(422).send({error: 'Missing body'});
    }
    User.findOne({"_id": ObjectId(_id)}, function(err, user){
        if(err){
            res.status(500).send({err:'MongoDB cannot find this user'});
            return next(err);
        }
        if(info['bloodtype']){
            user.about_patient.bloodtype = info['bloodtype'];
        }
        if(info['drugallergy']){
            user.about_patient.drugallergy = info['drugallergy'];
        }
        if(info['disease']){
            user.about_patient.disease = info['disease'];
        }
        if(info['email']){
            user.about.email = info['email'];
        }
        if(info['phone']){
            user.about.phone = info['phone'];
        }
        if(info['address2']){
            if(info['address2'].title){
                user.about.address2.title = info['address2'].title;

            }
            if(info['address2'].allow != user.about.address2.allow&& info['address2'].allow!= null && info['address2'].allow!=undefined){
                user.about.address2.allow = info['address2'].allow;
            }
        }
        if(info['address_allow'] != user.id_card.address.allow&& info['address_allow']!= null && info['address_allow']!=undefined){
            user.id_card.address.allow = info['address_allow']
        }
        user.markModified('id_card.address.allow');
        user.markModified('about_patient');
        user.markModified('about');
        user.save();
        return res.status(200).json({err:false, message:'Update success'})
    });
}

function setDoctorInfo(request){
    return {
        _id: request._id,
        thaiFullName : request.id_card.thaiFullName,
        engFullName : request.id_card.engFullName,
        birthOfDate : request.id_card.birthOfDate.toLocaleDateString(),
        address : request.id_card.address,
        gender: request.id_card.gender,
        role : request.role,
        about : request.about,
        about_doctor : request.about_doctor,
        firsttime : request.firsttime
    };
}
function setPatientInfo(request){
    return {
        _id: request._id,
        thaiFullName : request.id_card.thaiFullName,
        engFullName : request.id_card.engFullName,
        birthOfDate : request.id_card.birthOfDate.toLocaleDateString(),
        address : request.id_card.address,
        gender: request.id_card.gender,
        role : request.role,
        about : request.about,
        about_patient : request.about_patient,
        firsttime : request.firsttime,
    };
}

function getInfoAfterRegister(request){
    return {
        _id: request._id,
        firsttime : request.firsttime
    };
}

function getInfoStationLogin(request){
    return{
        _id: request._id,
        firstTimeKey: request.first_time_key,
        firsttime: request.firsttime,
        id_card : request.id_card
    }
}