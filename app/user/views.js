var jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectID;
var User = require('./models/user');
var Username = require('./models/username');
var FingerPrint = require('../finger_print/models');
var Station = require('../station/models');
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
        firsttime: req.user.firsttime,
        firstTimeKey: req.user.first_time_key
    });
}

exports.login = function(req, res, next){
    var provider_key =  req.headers['x-provider-key'];
        station_key = req.headers['x-station-key'];
    try{
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
    }catch(e){
        return res.status(500).send({error: e.message});
    }
}

exports.mobile_login = function(req, res, next){
    try{
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
    }catch(e){
        return res.status(500).send({error: e.message});
    }
}

exports.register = function(req, res, next){ // register ID_CARD
    var info = req.body;
    var station_key = req.headers['x-station-key'];
    var provider_key =  req.headers['x-provider-key'];
    var idNumber = info.idNumber;
    var finger_print = info.fingerPrint
    if(!idNumber){
        return res.status(422).send({error: 'Missing Id number'});
    }
    if(!finger_print){
        return res.status(422).send({error: 'Missing fingerPrint'});
    }
    if(!station_key || !provider_key){
        return res.status(400).send({error: 'Missing require header(s).'});
    }
    try{
        query_dict = {
            "_id":ObjectId(station_key),
            "provider":ObjectId(provider_key)
        };
        Station.findOne(query_dict, (err, station)=>{
            if(err){
                res.status(404).send({err:err.message});
                    return next(err);
            }

            if(station){
                if(info.thaiFullName && info.engFullName && info.birthOfDate && info.address && info.idNumber && info.gender){
                    User.findOne({"id_card.idNumber": idNumber}, function(err, existingUser){

                        if(err){
                            res.status(404).send({err:'MongoDB cannot find this user'});
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
                                res.status(409).send({error: 'MongoDB cannot connect'});
                                return next(err);
                            }
                            var finger_print = new FingerPrint({
                                finger_print: info.fingerPrint,
                                user: user._id
                            })
                            finger_print.save((error, finger_print) => {
                                if(error){
                                    res.status(409).send({error: 'MongoDB cannot connect'});
                                    return next(err);
                                }
                                var userInfo = getInfoAfterRegister(user);
                                res.status(201).json({
                                    token: 'JWT ' + generateToken(userInfo),
                                    user: userInfo
                                })
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
    }catch(e){
        return res.status(500).send({error: e.message});
    }
}

exports.firsttimeChanged = function(req, res, next){
    var info = req.body;
    var key = req.headers['x-user-key'];
    if(!key){
        return res.status(422).send({error: 'Missing require headers'});
    }
    try{
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
    }catch(e){
        return res.status(500).send({error: e.message});
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
    if(!_id){
        return res.status(422).send({error: 'Missing require headers'});
    }
    if(Object.keys(info).length == 0){
        return res.status(422).send({error: 'Missing body'});
    }
    try{
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
    }catch(e){
        return res.status(500).send({error: e.message});
    }
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
        firsttime : request.firsttime,
        firstTimeKey: request.first_time_key,
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
        firstTimeKey: request.first_time_key,
    };
}

function getInfoAfterRegister(request){
    return {
        _id: request._id,
        firsttime : request.firsttime,
        firstTimeKey: request.first_time_key,
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