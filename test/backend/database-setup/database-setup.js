module.exports = function (MONGO_DB_URI) {
    var async = require('async');
    var mongoose = require('mongoose');
    var Mockgoose = require('mockgoose').Mockgoose;
    var mockgoose = new Mockgoose(mongoose);
    var defaultData = require('./defaultData');

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
        return async.parallel([
            defaultData.insertAnsprechpartner,
            defaultData.insertUser,
            defaultData.insertVeranstaltungen
        ], cb);
    }

    return {
        disconnect: disconnect,
        connect: connect,
        fillDefaultData: fillDefaultData,
        getTokens: defaultData.getTokens,
        getEventID: defaultData.getEventID
    };
};
