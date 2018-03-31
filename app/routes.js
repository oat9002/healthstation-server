var passportService = require('./middlewares/passport'),
    StationController = require('./views/station')
    DataController = require('./views/healthData');
    UserController = require('./views/user')
    FingerprintView = require('./views/fingerPrint')
    ProviderAuthenController = require('./views/provider')

    express = require('express'),
    passport = require('passport');

var requireAuth = passport.authenticate('jwt', {session: false}),
    // requireLogin = passport.authenticate('local',{session: false});
    requireLoginBasic = passport.authenticate('basicLogin', { session: false })
    requireProviderLoginBasic = passport.authenticate('providerBasicLogin', { session: false })
    requireStationLoginBasic = passport.authenticate('stationBasicLogin', { session: false })

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
    authRoutes.post('/register/station', requireProviderLoginBasic, StationController.register_station);
    authRoutes.post('/register/card', UserController.register);
    authRoutes.post('/register/fingerprint', FingerprintView.register_finger_print);
    authRoutes.get('/login/fingerprint', FingerprintView.finger_print_login);
    authRoutes.get('/login', requireStationLoginBasic, UserController.login);
    authRoutes.get('/login/mobile', requireLoginBasic, UserController.mobile_login)
    authRoutes.put('/firsttimeupdate', requireAuth, UserController.firsttimeChanged);
    authRoutes.get('/protected', requireAuth, UserController.protected);

    // Data Routes
    apiRoutes.use('/data', dataRoutes);

    dataRoutes.get('/allLatest', DataController.getLatestData);
    dataRoutes.get('/period', requireAuth, DataController.findPeriodDataByType);
    dataRoutes.get('/latest', requireAuth, DataController.findLatestDataByType);
    dataRoutes.post('/save', DataController.insertData);

    dataRoutes.get('/fingerprint', FingerprintView.get_finger_print);

    apiRoutes.use('/user', userRoutes);
    userRoutes.put('/updateprofile', requireAuth, UserController.profileChanging);

    app.use('/api', apiRoutes);

}