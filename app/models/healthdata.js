var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var healthDataSchema = new mongoose.Schema({
        uid : {
                type : String,
                require : true
        },
        type : {
                type : String,
                require : true
        },
        h_value : {
                type : Number,
                require : true
        },
        l_value : {
                type : Number,
        },
        unit : {
                type : String,
                require : true
        },
        date_time : {
                type : Date,
                require : true,
                unique: true,
        }
},{
        timestamps: true,
});
healthDataSchema.index({uid:1, type: 1, date_time: 1}, {unique: true});

module.exports = mongoose.model('health_data', healthDataSchema);