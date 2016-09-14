module.exports = function (MONGO_DB_URI) {
    var async = require('async');
    var mongoose = require('mongoose');

    function connect(cb) {
        return mongoose.connect(MONGO_DB_URI, function (err) {
            if (err) throw err;
            return cb();
        });
    }

    function disconnect(cb) {
        return mongoose.disconnect(function (err) {
            if (err) throw err;
            return cb();
        });
    }

    return {
        disconnect: disconnect,
        connect: connect
    };
};
