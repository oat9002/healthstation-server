var Role = require('../models/role');
 
exports.getRoles = function(req, res, next){
 
    Role.find(function(err, roles) {
 
        if (err){
            res.send(err);
        }
 
        res.json(roles);
 
    });
 
}
 
exports.createRole = function(req, res, next){
 
    Role.create({
        title : req.body.title
    }, function(err, role) {
 
        if (err){
            res.send(err);
        }
 
        Role.find(function(err, roles) {
 
            if (err){
                res.send(err);
            }
 
            res.json(roles);
 
        });
 
    });
 
}
 
exports.deleteRole = function(req, res, next){
 
    Role.remove({
        _id : req.params.role_id
    }, function(err, role) {
        res.json(role);
    });
 
}