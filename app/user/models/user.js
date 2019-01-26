var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
const configs = require('../../../configs')

var UserSchema = new mongoose.Schema({
        id_card: {
                thaiFullName: String,
                engFullName: String,
                birthOfDate: Date,
                address: {
                        title: String,
                        allow: {
                                type: Boolean,
                                default: true
                        }
                },
                gender: String,
                idNumber: {
                        type: String,
                        unique: true,
                },
        },
        authentication: {
                username: {
                        type: String,
                },
                password: String,
        },
        about: {
                address2: {
                        title: String,
                        allow: {
                                type: Boolean,
                                default: false
                        }
                },
                phone: String,
                email: String,
        },
        about_patient: {
                bloodtype: {
                        type: String,
                        enum: ['A', 'B', 'AB', 'O', 'เอ', 'บี', 'เอบี', 'โอ'],
                },
                disease: String,
                drugallergy: String,
        },
        about_doctor: {
                educated: String,
                workplace: String,
                specialist: String,
        },
        role: {
                type: String,
                enum: ['doctor', 'patient', 'provider'],
                default: 'patient'
        },
        firsttime: {
                type: Boolean,
                default: true
        },
        first_time_key: {
                type: String
        }
}, {
                timestamps: true
        });

module.exports = mongoose.model('user', UserSchema);