module.exports = function (MONGO_DB_URI) {
    var async = require('async');
    var mongoose = require('mongoose');
    var Mockgoose = require('mockgoose').Mockgoose;
    var mockgoose = new Mockgoose(mongoose);
    var defaultData = require('./defaultData');
    const cls = require('../../../src/config/cls.js');

    function connect(cb) {
        return mockgoose.prepareStorage().then(function() {
            return mongoose.connect(MONGO_DB_URI, function (err) {
                if (err) return cb(err);

                return fillDefaultData(cb);
            });
        });
    }

    function disconnect(cb) {
        return mongoose.disconnect(function (err) {
            if (err) throw err;
            return cb();
        });
    }

    function fillDefaultData(cb) {
        mockgoose.helper.reset().then(() => {
            return defaultData.insertVeranstaltungen(function (err, veranstaltung) {
                if (err || !veranstaltung || veranstaltung.length === 0) return cb(err);

                const beachEventID = veranstaltung[0]._id.toString();
                const clsSession = cls.getNamespace();
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return async.parallel([
                        defaultData.insertAnsprechpartner,
                        defaultData.insertUser,
                        defaultData.insertJugenden,
                        defaultData.insertGruppe,
                        defaultData.insertSpielplan,
                        defaultData.insertSpiel,
                        defaultData.insertTeam,
                        defaultData.insertSubscriber
                    ], cb);
                });
            });
        });
    }

    return {
        disconnect: disconnect,
        connect: connect,
        fillDefaultData: fillDefaultData,
        getTokens: defaultData.getTokens,
        getEventID: defaultData.getEventID,
        getIDs: defaultData.getIDs
    };
};
