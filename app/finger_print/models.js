var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var FingerPrintSchema = new mongoose.Schema({
    finger_print: [String],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'provider',
        unique: true
    }
},{
        timestamps: true
});

module.exports = mongoose.model('fingerPrint', FingerPrintSchema);