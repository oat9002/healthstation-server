var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var HealthcareProvider = new mongoose.Schema({
    name : {
        type:String,
        required:true
    },
    owner : String,
    address : {
        type:String,
        require : true
    },
    phones:[String],
    patients:[
        {
            patient_id : String,
            patient_name : String,
            agreement : {
                type:Boolean,
                default: false
            }
        }
    ],
    docters:[
        {
            doctor_id : String,
            doctor_name : String,
            agreement : {
                type:Boolean,
                default: false
            }
        }
    ],
    stations:[String]
},{
        timestamps: true
});

module.exports = mongoose.model('provider', HealthcareProvider);