var passportService = require('./utils/passport'),
    StationView = require('./station/views'),
    DataView = require('./health_data/views'),
    UserView = require('./user/views'),
    FingerprintView = require('./finger_print/views'),
    ProviderAuthenController = require('./provider/views'),
    logging = require('./utils/logging');
var logger = logging.get_logger("api");

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
    authRoutes.post('/register/station', requireProviderLoginBasic, StationView.register_station);
    authRoutes.post('/register/', UserView.register);
    authRoutes.post('/register/fingerprint', FingerprintView.register_finger_print);
    authRoutes.get('/login/fingerprint', FingerprintView.finger_print_login);
    authRoutes.get('/login', requireStationLoginBasic, UserView.login);
    authRoutes.get('/login/mobile', requireLoginBasic, UserView.mobile_login)
    authRoutes.put('/firsttimeupdate', requireAuth, UserView.firsttimeChanged);
    authRoutes.get('/protected', requireAuth, UserView.protected);

    // Data Routes
    apiRoutes.use('/data', dataRoutes);

    dataRoutes.get('/allLatest', DataView.getLatestData);
    dataRoutes.get('/period', requireAuth, DataView.findPeriodDataByType);
    dataRoutes.get('/latest', requireAuth, DataView.findLatestDataByType);
    dataRoutes.post('/save', DataView.insertData);

    dataRoutes.get('/fingerprint', FingerprintView.get_finger_print);

    apiRoutes.use('/user', userRoutes);
    userRoutes.put('/updateprofile', requireAuth, UserView.profileChanging);

    app.use('/api', apiRoutes);

}