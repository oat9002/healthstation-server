var mongoose = require('mongoose');
 
var RoleSchema = new mongoose.Schema({
 
    title: {
        type: String,
        required: true
    }
 
}, {
    timestamps: true
});
 
module.exports = mongoose.model('Role', RoleSchema);