var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var StationKeySchema = new mongoose.Schema({
    provider:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'provider'
    },
    active: {
        type: Boolean,
        default: true
    },
    name: {
        type: String,
        required: true,
    }
},{
        timestamps: true
});
StationKeySchema.index({provider:1, name: 1}, {unique: true});

module.exports = mongoose.model('station', StationKeySchema);