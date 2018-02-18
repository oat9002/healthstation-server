var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
 
var healthDataSchema = new mongoose.Schema({
        uid : {
                type : String,
                require : true
        },
        type : {
                type : String
        },
        h_value : {
                type : Number
        },
        l_value : {
                type : Number
        },
        unit : {
                type : String
        },
        date_time : {
                type : Date,
                require : true,
        }
},{
        timestamps: true,
        unique: true,
});
healthDataSchema.index({uid:1, type: 1, date_time: 1}, {unique: true});
 
module.exports = mongoose.model('health_data', healthDataSchema);