var passportService = require('./middlewares/passport'),
    AuthenticationController = require('./views/authentication'),
    DataController = require('./views/healthData');
    UserController = require('./views/user')
    FingerprintView = require('./views/fingerPrint')
    ProviderAuthenController = require('./views/providerAuthen')
    express = require('express'),
    passport = require('passport');

var requireAuth = passport.authenticate('jwt', {session: false}),
    // requireLogin = passport.authenticate('local',{session: false});
    requireLoginBasic = passport.authenticate('basicLogin', { session: false })
    requireProviderLoginBasic = passport.authenticate('providerBasicLogin', { session: false })

module.exports = function(app){

    var apiRoutes = express.Router(),
        authRoutes = express.Router(),
        roleRoutes = express.Router();
        dataRoutes = express.Router();
        userRoutes = express.Router();

    // Auth Routes
    apiRoutes.use('/auth', authRoutes);

    // Internal use
    authRoutes.post('/register/provider', ProviderAuthenController.provider_register);
    // Public use
    authRoutes.post('/register/station', requireProviderLoginBasic,AuthenticationController.register_station);
    authRoutes.post('/register/card', requireProviderLoginBasic, AuthenticationController.register);
    authRoutes.post('/register/fingerprint', requireProviderLoginBasic, AuthenticationController.register_finger_print);
    authRoutes.get('/login/fingerprint', requireProviderLoginBasic, FingerprintView.finger_print_login);
    authRoutes.get('/login', requireLoginBasic, AuthenticationController.login);
    authRoutes.put('/firsttimeupdate', requireAuth, AuthenticationController.firsttimeChanged);
    authRoutes.get('/protected', requireAuth, AuthenticationController.protected);

    // Data Routes
    apiRoutes.use('/data', dataRoutes);

    dataRoutes.get('/allLatest', DataController.getLatestData);
    dataRoutes.get('/period', requireAuth, DataController.findPeriodDataByType);
    dataRoutes.get('/latest', requireAuth, DataController.findLatestDataByType);
    dataRoutes.post('/save', DataController.insertData);

    dataRoutes.get('/fingerprint', requireProviderLoginBasic, FingerprintView.get_finger_print);

    apiRoutes.use('/user', userRoutes);
    userRoutes.put('/updateprofile', requireAuth, UserController.profileChanging);

    app.use('/api', apiRoutes);

}