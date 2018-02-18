var jwt = require('jsonwebtoken');  
var ObjectId = require('mongodb').ObjectID;
// var User = require('../models/user');
var User = require('../models/user_model');
var config = require('../../config/develop');
var Role = require('../models/role');
 
function generateToken(user){
    info = {
        _id: user._id,
        thaiFullName : user.thaiFullName,
        engFullName : user.engFullName
    }
    return jwt.sign(info, config.secret, {
        expiresIn: 5000
    });
}

exports.protected = function(req, res, next){
    res.status(200).json({
        role: req.user.role,
        firsttime: req.user.firsttime
    });
}
 
exports.login = function(req, res, next){
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

exports.register = function(req, res, next){ // register 
    var info = req.body;
    var type = req.headers['register-type'];
    var idNumber = info.idNumber;
    if(!idNumber){
        return res.status(422).send({error: 'Missing Id number'}); 
    }
    if(type=="idcard"){
        if(info.thaiFullName && info.engFullName && info.birthOfDate && info.address && info.idNumber && info.gender){
            User.findOne({"id_card.idNumber": idNumber}, function(err, existingUser){
                if(err){
                    res.status(500).send({err:'MongoDB cannot find this user'});
                    return next(err);
                }
                if(existingUser){
                    res.status(422).send({error: 'this id number is already exist'});
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
                        password : birth_date.getDate()+""+(birth_date.getMonth()+1)+""+(birth_date.getFullYear()+543)
                    },
                    firsttime: true,
                    role : info.role
                });

                user.save(function(err, user){
        
                    if(err){
                        res.status(502).send({error: 'MongoDB cannot connect'});
                        return next(err);
                    }
                    if(user.role==="patient"){
                        var userInfo = setPatientInfo(user);
                        res.status(201).json({
                            token: 'JWT ' + generateToken(userInfo),
                            user: userInfo
                        })
                    }else{
                        var userInfo = setDoctorInfo(user);
                        res.status(201).json({
                            token: 'JWT ' + generateToken(userInfo),
                            user: userInfo
                        })
                    }
                });
            })
        }else{
            return res.status(406).send({error : 'Missing field in json'});
        }
    }else{
        return res.status(422).send({error: 'Missing Register-Type'});
    }
}

exports.firsttimeChanged = function(req, res, next){
    var info = req.body;
    var _id = req.headers['_id'];
    if(!_id){
        return res.status(422).send({error: 'Missing require headers'});     
    }
    if(info.username && info.password){
        User.findOne({"_id": ObjectId(_id)}, function(err, existingUser){
            if(err){
                res.status(500).send({err:'MongoDB cannot find this user'});
                return next(err);
            }
            existingUser.authentication = {
                username : info.username,
                password : info.password
            };
            existingUser.firsttime = false;
            existingUser.markModified('authentication');
            existingUser.markModified('firsttime');
            existingUser.save();
            return res.status(200).json({err:false, message:'Update success'})
        });
    }else{
        return res.status(406).send({error:'Missing field in json'});
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