var passport = require('passport');

var User = require('../user/models/user');
    Provider = require('../provider/models')
var config = require('../../configs');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy
// var FacebookStrategy = require('passport-facebook').Strategy;

var basicOptions = {
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
};

var basicLogin = new BasicStrategy(basicOptions, function(req, username, password, done) {
    User.findOne({"authentication.username": username}, function(err, user){
        if(err){
            return done(null, false, {message:err});
        }
        if(!user){
            return done(null, false, {message: 'Login failed. Please try again.'});
        }

        if(password===user.authentication.password){
            return done(null, user);
        }else{
            return done(null, false, {message:'Wrong password'});
        }
    });

});

var stationBasicLogin = new BasicStrategy(basicOptions, function(req, username, password, done) {
    User.findOne({"id_card.idNumber": username}, function(err, user){
        if(err){
            return done(null, false, {message:err});
        }
        if(!user){
            return done(null, false, {message: 'Login failed. Please try again.'});
        }

        birth_date = user.id_card.birthOfDate
        user_password = ("0" + birth_date.getDate()).slice(-2)+""+("0" + (birth_date.getMonth() + 1)).slice(-2)+""+(birth_date.getFullYear()+543);

        if(password===user_password){
            return done(null, user);
        }else{
            return done(null, false, {message:'Wrong password'});
        }
    });

});

var providerBasicLogin = new BasicStrategy(basicOptions, function(req, username, password, done) {
    Provider.findOne({"authentication.username": username}, function(err, user){
        if(err){
            return done(null, false, {message:err});
        }
        if(!user){
            return done(null, false, {message: 'Login failed. Please try again.'});
        }

        if(password===user.authentication.password){
            return done(null, user);
        }else{
            return done(null, false, {message:'Wrong password'});
        }
    });

});

var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    secretOrKey: config.secret
};

var jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
    User.findById(payload._id, function(err, user){
        if(err){
            return done(err, false);
        }
        if(user){
            if(payload.engFullName === user.id_card.engFullName){
                return done(null, user);
            }else{
                return done(err, false);
            }
        } else {
            done(null, false);
        }

    });

});

passport.use(jwtLogin);
passport.use('providerBasicLogin', providerBasicLogin);
passport.use('stationBasicLogin', stationBasicLogin)
passport.use('basicLogin', basicLogin);



// var localOptions = {
//     usernameField: 'email',
//     passwordField: ''
// };

// var localLogin = new LocalStrategy( function(username, password, done) {
//     User2.findOne({ username: username }, function (err, user) {
//         if (err) {
//           return done(err);
//         }
//         if (!user) {
//             return done(null, false);
//         }
//         if (!user.verifyPassword(password)) {
//             return done(null, false);
//         }
//         return done(null, user);
//     });
// });

// var localLogin = new LocalStrategy(localOptions, function(idNumber, password, done){
//     User2.findOne({
//         idNumber: idNumber
//     }, function(err, user){

//         if(err){
//             return done(err);
//         }

//         if(!user){
//             return done(null, false, {error: 'Login failed. Please try again.'});
//         }
//         return done(null, user);
//     });

// });

// module.exports = function(passport) {

//     // used to serialize the user for the session
//     passport.serializeUser(function(user, done) {
//         done(null, user.id);
//     });

//     // used to deserialize the user
//     passport.deserializeUser(function(id, done) {
//         User.findById(id, function(err, user) {
//             done(err, user);
//         });
//     });

//     // code for login (use('local-login', new LocalStategy))
//     // code for signup (use('local-signup', new LocalStategy))

//     // =========================================================================
//     // FACEBOOK ================================================================
//     // =========================================================================
//     passport.use(new FacebookStrategy({

//         // pull in our app id and secret from our auth.js file
//         client_id        : configAuth.facebook_auth.client_id,
//         client_secret    : configAuth.facebook_auth.client_secret,
//         callback_url     : configAuth.facebook_auth.callback_url

//     },

//     // facebook will send back the token and profile
//     function(token, refreshToken, profile, done) {

//         // asynchronous
//         process.nextTick(function() {

//             // find the user in the database based on their facebook id
//             User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

//                 // if there is an error, stop everything and return that
//                 // ie an error connecting to the database
//                 if (err)
//                     return done(err);

//                 // if the user is found, then log them in
//                 if (user) {
//                     return done(null, user); // user found, return that user
//                 } else {
//                     // if there is no user found with that facebook id, create them
//                     var newUser            = new User();

//                     // set all of the facebook information in our user model
//                     newUser.facebook.id    = profile.id; // set the users facebook id
//                     newUser.facebook.token = token; // we will save the token that facebook provides to the user
//                     newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
//                     newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

//                     // save our user to the database
//                     newUser.save(function(err) {
//                         if (err)
//                             throw err;

//                         // if successful, return the new user
//                         return done(null, newUser);
//                     });
//                 }

//             });
//         });

//     }));

// };