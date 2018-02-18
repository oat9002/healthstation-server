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
    phones:[
        {
            phone : String
        }
    ],
    patient_list:[
        { 
            patient_id : String,
            patient_name : String,
            agreement : {
                type:Boolean,
                default: false
            }
        }
    ],
    docter_list:[
        {
            doctor_id : String,
            doctor_name : String,
            agreement : {
                type:Boolean,
                default: false
            }
        }
    ],
},{
        timestamps: true
});
 
module.exports = mongoose.model('provider', HealthcareProvider);