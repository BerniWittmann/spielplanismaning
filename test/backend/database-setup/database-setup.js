module.exports = function (MONGO_DB_URI, ROOT) {
    var async = require('async');
    var mongoose = require('mongoose');
    var spawn = require('child_process').spawn;
    ROOT = (ROOT || __dirname + '/data/spielplan');
    var LOGGING = false;

    function connect(cb) {
        mongoose.connect(MONGO_DB_URI, function (err) {
            if (err) throw err;
            return cb();
        });
    }

    function wipeDB(cb) {
        connect(function (err) {
            if (err) throw err;
            mongoose.connection.db.dropDatabase(function (err) {
                if (err) throw err;
                return cb();
            });
        });
    }

    function createSampleDB(cb) {
        var args = ['--db', 'spielplan-test', '--drop', ROOT];
        var mongorestore = spawn(__dirname + '/mongorestore', args);
        mongorestore.stdout.on('data', function (data) {
            if (LOGGING) console.log('stdout: ' + data);
        });
        mongorestore.stderr.on('data', function (data) {
            if (LOGGING) console.log('stderr: ' + data);
        });
        mongorestore.on('exit', function (code) {
            if (LOGGING) console.log('mongorestore exited with code ' + code);
            cb();
        });
    }

    return {
        createSampleDB: createSampleDB,
        wipeDB: wipeDB,
        wipeAndCreate: function (cb) {
            async.waterfall([wipeDB, createSampleDB],
                function (err) {
                    if (err) throw err;
                    cb();
                }
            )
            ;
        }
    };
};
