var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
const configs = require('../../../configs')

var UsernameSchema = new mongoose.Schema({
        username: {
                type: String,
                unique: true
        }
}, {
                timestamps: true
        });

module.exports = mongoose.model('username', UsernameSchema);