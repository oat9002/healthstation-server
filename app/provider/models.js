var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var ProviderSchema = new mongoose.Schema({
        name: {
                type: String,
                required: true,
                unique: true
        },
        address: {
                type: String,
                require: true
        },
        phone: {
                type: String,
        },
        fax: {
                type: String,
        },
        email: {
                type: String,
        },
        active: {
                type: Boolean,
                default: true
        },
        authentication: {
                username: {
                        type: String,
                },
                password: String,
        },
        created_time: {
                type: Date,
                required: true
        },
        patients: [
                {
                        id: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: 'user'
                        },
                        agreement: {
                                type: Boolean,
                                default: false
                        }
                }
        ],
        docters: [
                {
                        id: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: 'user'
                        },
                        agreement: {
                                type: Boolean,
                                default: false
                        }
                }
        ]
}, {
                timestamps: true
        });

ProviderSchema.pre('save', function (next) {
        var user = this;
        bcrypt.hash(user.authentication.password, configs.hashsalt, function (err, hash) {
                if (err) {
                        return next(err);
                }
                user.authentication.password = hash;
                next();
        })
});

module.exports = mongoose.model('provider', ProviderSchema);