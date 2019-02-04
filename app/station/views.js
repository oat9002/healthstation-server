var ObjectId = require('mongodb').ObjectID;
var Station = require('../station/models');
var Provider = require('../provider/models')

exports.register_station = function(req, res, next){
    var provider_id =  req.headers['x-provider-key'];
        body = req.body;
    try{
        if(provider_id && body.name){
            Provider.findOne({"_id": ObjectId(provider_id)}, (err, provider)=>{
                if(err){
                    res.status(404).send({err:err.message});
                    return next(err);
                }
                var station = new Station({
                    provider: provider._id,
                    active: true,
                    name: body.name
                });

                station.save(function(err, result){

                    if(err){
                        res.status(400).send({error: err.message});
                        return next(err);
                    }
                    res.status(201).json({
                        station_key: result._id
                    })
                });
            });
        }else{
            res.status(404).send({error: 'Cannot find this provider'});
        }
    }catch(e){
        return res.status(500).send({error: e.message});
    }
}
