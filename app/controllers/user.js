var User = require('../models/user_model');
var ObjectId = require('mongodb').ObjectID;

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