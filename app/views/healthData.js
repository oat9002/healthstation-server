var Data = require('../models/healthdata');
var User = require('../models/user');
var ObjectId = require('mongodb').ObjectID;
var jwt = require('jsonwebtoken');

exports.insertData = function (req, res, next) { //save
    var doc = req.body;
    var user_id = req.headers['user_id'];
    try{
        if (!user_id) {
            return res.status(400).send({
                error: 'Missing require header'
            });
        } else {
            User.findOne({
                _id: ObjectId(user_id)
            }, function (err, existingUser) {
                var arr = {};
                if (err) {
                    return res.status(500).send({
                        error: 'Internal server error due to : ' + err
                    });
                }
                if (!existingUser) {
                    return res.status(404).send({
                        error: 'Cannot find this user.'
                    });
                }
                arr = {}
                arr['uid'] = ObjectId(user_id)
                arr['date_time'] = doc.effective_time_frame.date_time;
                if (doc.body_temperature) {
                    arr['h_value'] = doc.body_temperature.value;
                    arr['unit'] = doc.body_temperature.unit;
                    arr['type'] = "temperature";
                } else if (doc.systolic_blood_pressure && doc.diastolic_blood_pressure) {
                    arr['h_value'] = doc.systolic_blood_pressure.value;
                    arr['l_value'] = doc.diastolic_blood_pressure.value;
                    arr['unit'] = doc.systolic_blood_pressure.unit;
                    arr['type'] = "bloodpressure";
                } else if (doc.body_weight) {
                    arr['h_value'] = doc.body_weight.value;
                    arr['unit'] = doc.body_weight.unit;
                    arr['type'] = "weight";
                } else if (doc.body_height) {
                    arr['h_value']= doc.body_height.value;
                    arr['unit']= doc.body_height.unit;
                    arr['type']= "height";
                } else if (doc.heart_rate) {
                    arr['h_value']= doc.heart_rate.value;
                    arr['unit']= doc.heart_rate.unit;
                    arr['type']= "heartrate";
                } else {
                    return res.status(400).send({
                        error: 'Data schema error'
                    });
                }
                var data = new Data({
                    uid: arr.uid,
                    h_value: arr.h_value,
                    l_value: arr.l_value,
                    unit: arr.unit,
                    type: arr.type,
                    date_time: arr.date_time
                })
                data.save(function (err, data) {
                    if (err) {
                        if (err.code == 11000) {
                            return res.status(406).send({
                                error: 'Duplicate data'
                            });
                        }
                        return res.status(500).send({
                            error: 'Internal server error due to : ' + err
                        });
                    }

                    return res.status(201).send({
                        error: false
                    })

                });
            });
        }
    }catch(e){
        return res.status(500).send({error: e.message});
    }
}

// exports.saveHealthdata = function(req, res, next){ //save
//         var doc = req.body;
//         var user_id = req.headers['user_id'];
//         if(!user_id){
//                 return res.status(400).send({error: 'Missing require header'});
//         }else{
//                 User.findOne({_id: ObjectId(user_id)}, function(err, existingUser){
//                         var arr = {};
//                         if(err){
//                                 return res.status(500).send({error: 'Internal server error due to : '+err});
//                         }
//                         if(!existingUser){
//                                 return res.status(404).send({error: 'Cannot find this user.'});
//                         }
//                         for
//                         if(doc.body_temperature){
//                                 arr = {
//                                         uid : user_id,
//                                         h_value : doc.body_temperature.value,
//                                         unit : doc.body_temperature.unit,
//                                         type : "temperature",
//                                         date_time : doc.effective_time_frame.date_time
//                                 }
//                         }else if(doc.systolic_blood_pressure && doc.diastolic_blood_pressure){
//                                 arr = {
//                                         uid : user_id,
//                                         h_value : doc.systolic_blood_pressure.value,
//                                         l_value : doc.diastolic_blood_pressure.value,
//                                         unit : doc.systolic_blood_pressure.unit,
//                                         type : "bloodpressure",
//                                         date_time : doc.effective_time_frame.date_time
//                                 }
//                         }else if(doc.body_weight){
//                                 arr = {
//                                         uid : user_id,
//                                         h_value : doc.body_weight.value,
//                                         unit : doc.body_weight.unit,
//                                         type : "weight",
//                                         date_time : doc.effective_time_frame.date_time
//                                 }
//                         }else if(doc.body_height){
//                                 arr = {
//                                         uid : user_id,
//                                         h_value : doc.body_height.value,
//                                         unit : doc.body_height.unit,
//                                         type : "height",
//                                         date_time : doc.effective_time_frame.date_time
//                                 }
//                         }else if(doc.heart_rate){
//                                 arr = {
//                                         uid : user_id,
//                                         h_value : doc.heart_rate.value,
//                                         unit : doc.heart_rate.unit,
//                                         type : "heartrate",
//                                         date_time : doc.effective_time_frame.date_time
//                                 }
//                         }else{
//                                 return res.status(400).send({error : 'Data schema error'});
//                         }
//                         var data = new Data({
//                                 uid : arr.uid,
//                                 h_value : arr.h_value,
//                                 l_value : arr.l_value,
//                                 unit : arr.unit,
//                                 type : arr.type,
//                                 date_time : arr.date_time
//                         })
//                         data.save(function(err, data){
//                                 if(err){
//                                         if(err.code==11000){
//                                                 return res.status(406).send({error: 'Duplicate data'});
//                                         }
//                                         return res.status(500).send({error: 'Internal server error due to : ' +err});
//                                 }

//                                 return res.status(201).send({error: false})

//                         });
//                 });
//         }
// }

exports.getLatestData = function (req, response, next) { //get latest data of all data type
    var user_id = req.headers['user_id'];
    var remain = 5;
    var count_err = 0;
    data = {};
    if (!user_id) {
        return response.status(400).send({
            error: 'Missing require header'
        });
    } else {
        try{
            findLatestData(user_id, "heartrate", function (err, docs) {
                if (err) {
                    return response.status(500).send({
                        error: 'Internal server error'
                    });
                }
                if (docs) {
                    data['heart_rate'] = {
                        "value": docs.h_value,
                        "unit": docs.unit
                    }
                    data['effective_time_frame'] = {
                        "date_time": docs.date_time
                    }
                } else {
                    count_err++;
                }
                remain--;
                if (remain == 0) {
                    return response.status(200).send(data);
                }
            });
            findLatestData(user_id, "bloodpressure", function (err, docs) {
                if (err) {
                    return response.status(500).send({
                        error: 'Internal server error'
                    });
                }
                if (docs) {
                    data['systolic_blood_pressure'] = {
                        "value": docs.h_value,
                        "unit": docs.unit
                    }
                    data['diastolic_blood_pressure'] = {
                        "value": docs.l_value,
                        "unit": docs.unit
                    }
                    data['effective_time_frame'] = {
                        "date_time": docs.date_time
                    }
                } else {
                    count_err++;
                }
                remain--;
                if (remain == 0) {
                    return response.status(200).send(data);
                }
            });
            findLatestData(user_id, "weight", function (err, docs) {
                if (err) {
                    return response.status(500).send({
                        error: 'Internal server error'
                    });
                }
                if (docs) {
                    data['body_weight'] = {
                        "value": docs.h_value,
                        "unit": docs.unit
                    }
                    data['effective_time_frame'] = {
                        "date_time": docs.date_time
                    }
                } else {
                    count_err++;
                }
                remain--;
                if (remain == 0) {
                    return response.status(200).send(data);
                }
            });
            findLatestData(user_id, "height", function (err, docs) {
                if (err) {
                    return response.status(500).send({
                        error: 'Internal server error'
                    });
                }
                if (docs) {
                    data['body_height'] = {
                        "value": docs.h_value,
                        "unit": docs.unit
                    }
                    data['effective_time_frame'] = {
                        "date_time": docs.date_time
                    }
                } else {
                    count_err++;
                }
                remain--;
                if (remain == 0) {
                    return response.status(200).send(data);
                }
            });
            findLatestData(user_id, "temperature", function (err, docs) {
                if (err) {
                    return response.status(500).send({
                        error: 'Internal server error'
                    });
                }
                if (docs) {
                    data['body_temperature'] = {
                        "value": docs.h_value,
                        "unit": docs.unit
                    }
                    data['effective_time_frame'] = {
                        "date_time": docs.date_time
                    }
                } else {
                    count_err++;
                }
                remain--;
                if (remain == 0) {
                    return response.status(200).send(data);
                }
            });
            if (count_err == 5 && remain == 0) {
                return response.status(404).send({
                    error: "Data not found"
                });
            }
        }catch(e){
            return res.status(500).send({error: e.message});
        }
    }
}

exports.findPeriodDataByType = function (req, res, next) { // find 1 data by type
    var user_id = req.headers['user_id'];
    var period = req.headers['period'];
    var type = req.headers['type'];
    if (!user_id || !period || !type) {
        return res.status(400).send({
            error: "Missing require header"
        });
    } else {
        try{
            findDataByPeriod(user_id, type, period, function (err, resp) {

                if (err) {
                    return res.status(500).send({
                        error: 'Internal server error'
                    });
                }
                if (Object.keys(resp).length === 0) {
                    return res.status(404).send({
                        error: "Can't find any data"
                    });
                } else {
                    return res.status(200).send(resp);
                }
            });
        }catch(e){
            return res.status(500).send({error: e.message});
        }
    }
}

exports.findLatestDataByType = function (req, res, next) { // find 1 latest data by type
    var user_id = req.headers['user_id'];
    var type = req.headers['type'];
    if (!user_id || !type) {
        return res.status(400).send({
            error: "Missing require header"
        });
    } else {
        try{
            findLatestData(user_id, type, function (err, docs) {
                var data = {};
                if (!docs) {
                    return res.status(404).send({
                        error: "Can't find any data"
                    });
                } else {
                    if (docs.type === "heartrate") {
                        data['heart_rate'] = {
                            "value": docs.h_value,
                            "unit": docs.unit
                        }
                        data['effective_time_frame'] = {
                            "date_time": docs.date_time
                        }
                    } else if (docs.type === "bloodpressure") {
                        data['systolic_blood_pressure'] = {
                            "value": docs.h_value,
                            "unit": docs.unit
                        }
                        data['diastolic_blood_pressure'] = {
                            "value": docs.l_value,
                            "unit": docs.unit
                        }
                        data['effective_time_frame'] = {
                            "date_time": docs.date_time
                        }
                    } else if (docs.type === "temperature") {
                        data['body_temperature'] = {
                            "value": docs.h_value,
                            "unit": docs.unit
                        }
                        data['effective_time_frame'] = {
                            "date_time": docs.date_time
                        }
                    } else if (docs.type === "weight") {
                        data['body_weight'] = {
                            "value": docs.h_value,
                            "unit": docs.unit
                        }
                        data['effective_time_frame'] = {
                            "date_time": docs.date_time
                        }
                    } else if (docs.type === "height") {
                        data['body_height'] = {
                            "value": docs.h_value,
                            "unit": docs.unit
                        }
                        data['effective_time_frame'] = {
                            "date_time": docs.date_time
                        }
                    }
                    return res.status(200).send(data);
                }
            });
        }catch(e){
            return res.status(500).send({error: e.message});
        }
    }
}


// ========================================Internal function========================================================

function findLatestData(user_id, type, callback) {
    Data.findOne({
        "uid": user_id,
        "type": type
    }).sort({
        "date_time": -1
    }).limit(1).exec(function (err, data) {
        if (err) callback(handleError(err), null);
        callback(null, data);
    })
}

function findDataByPeriod(user_id, type, period, callback) {
    var start;
    var end;
    if (period == "week") {
        start = new Date();
        start.setDate(start.getDate() - 6);
        start.setHours(0);
        start.setMinutes(0);
        end = new Date();
    } else if (period == "month") {
        start = new Date();
        start.setDate(1);
        start.setHours(0);
        start.setMinutes(0);
        end = new Date();
        end.setDate(getDateInMonth(end.getFullYear(), end.getMonth()));
        end.setHours(0);
        end.setMinutes(0);
    } else if (period == "year") {
        start = new Date();
        start.setFullYear(start.getFullYear() - 1)
        start.setDate(1);
        start.setHours(0);
        start.setMinutes(0);
        end = new Date();
        end.setDate(getDateInMonth(end.getFullYear(), end.getMonth()));
        end.setHours(0);
        end.setMinutes(0);
    }

    Data.find({
        "uid": user_id,
        "type": type,
        date_time: {
            $gt: start,
            $lt: end
        }
    }, function (err, docs) {
        arr = [];
        if (!docs) {
            callback({
                err: "Doesn't have those data"
            }, null);
        }
        for (index in docs) {
            var data = {};
            if (docs[index].type === "heartrate") {
                data['heart_rate'] = {
                    "value": docs[index].h_value,
                    "unit": docs[index].unit
                }
                data['effective_time_frame'] = {
                    "date_time": docs[index].date_time
                }
            } else if (docs[index].type === "bloodpressure") {
                data['systolic_blood_pressure'] = {
                    "value": docs[index].h_value,
                    "unit": docs[index].unit
                }
                data['diastolic_blood_pressure'] = {
                    "value": docs[index].l_value,
                    "unit": docs[index].unit
                }
                data['effective_time_frame'] = {
                    "date_time": docs[index].date_time
                }
            } else if (docs[index].type === "temperature") {
                data['body_temperature'] = {
                    "value": docs[index].h_value,
                    "unit": docs[index].unit
                }
                data['effective_time_frame'] = {
                    "date_time": docs[index].date_time
                }
            } else if (docs[index].type === "weight") {
                data['body_weight'] = {
                    "value": docs[index].h_value,
                    "unit": docs[index].unit
                }
                data['effective_time_frame'] = {
                    "date_time": docs[index].date_time
                }
            } else if (docs[index].type === "height") {
                data['body_height'] = {
                    "value": docs[index].h_value,
                    "unit": docs[index].unit
                }
                data['effective_time_frame'] = {
                    "date_time": docs[index].date_time
                }
            }
            arr.push(data);
        }
        callback(null, arr)
    });
}

function getDateInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}