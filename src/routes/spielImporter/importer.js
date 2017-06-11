const validator = require('./validator/validator.js');
const async = require('async');
const mongoose = require('mongoose');
const Spiel = mongoose.model('Spiel');
const Team = mongoose.model('Team');
const Gruppe = mongoose.model('Gruppe');
const Jugend = mongoose.model('Jugend');
const cls = require('../../config/cls.js');
const validationErrors = require('./validator/validationErrors.js');
const logger = require('winston').loggers.get('spielplanImporter');
const _ = require('lodash');

function deleteSpiele(cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spiel.remove({veranstaltung: beachEventID}, cb);
    });
}

function findIDBySlug(data, slug) {
    if (!data) return undefined;
    const obj = data.find(function (single) {
       return single.slug === slug;
    });

    return obj ? obj._id.toString() : undefined;
}

function loadData(store, key, model, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);

        return model.find({}, function (err, data) {
            if (err) return cb(err);

            store[key] = data;
            return cb(null, data);
        });
    });
}

function loadTeams(store, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);

        return loadData(store, 'teams', Team, cb);
    });
}

function loadJugenden(store, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);

        return loadData(store, 'jugenden', Jugend, cb);
    });
}

function loadGruppen(store, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);

        return loadData(store, 'gruppen', Gruppe, cb);
    });
}

function prepareField(key, storeKey, store, spiel, index, errMessage, cb) {
    if (!spiel[key]) return cb();
    const id = findIDBySlug(store[storeKey], spiel[key]);
    if (!id) return cb(errMessage(index, key, spiel[key]));

    spiel[key] = id;
    return cb();
}

function prepareSpiel(spiel, index, store, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);

        return async.parallel([
            function (asyncdone) {
                return prepareField('turnier', 'jugenden', store, spiel, index, validationErrors.entityNotFound, asyncdone)
            },
            function (asyncdone) {
                return prepareField('gruppe', 'gruppen', store, spiel, index, validationErrors.entityNotFound, asyncdone)
            },
            function (asyncdone) {
                return prepareField('teamA', 'teams', store, spiel, index, validationErrors.entityNotFound, asyncdone)
            },
            function (asyncdone) {
                return prepareField('teamB', 'teams', store, spiel, index, validationErrors.entityNotFound, asyncdone)
            }
        ], function (err) {
            if (err) return cb(err);

            spiel.label = spiel.spielLabel;

            return cb(null, spiel);
        });
    });
}

function addSpiele(spiele, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);

        const store = {};

        return async.parallel([
            function (asyncdone) {
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return loadTeams(store, asyncdone);
                });
            },
            function (asyncdone) {
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return loadGruppen(store, asyncdone);
                });
            },
            function (asyncdone) {
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return loadJugenden(store, asyncdone);
                });
            }
        ], function (err) {
            logger.verbose('Data loaded');
            if (err) return cb(err);
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);


                return async.mapValues(spiele, function (spiel, index, asyncdone) {
                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);

                        return prepareSpiel(spiel, index, store, asyncdone);
                    });
                }, function (err, spiele) {
                    if (err) return cb(err);
                    console.log(_.values(spiele));
                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);

                        logger.warn('Before add');
                        return Spiel.insertMany(_.values(spiele), cb);
                    });
                });
            });
        });
    });
}

function importSpiele(spiele, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return async.eachOf(spiele, function (spiel, index, asyncdone) {
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return validator.validateSpiel(spiel, index, asyncdone);
            });
        }, function (err) {
            if (err) return cb(err);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);

                return deleteSpiele(function (err) {
                    if (err) return cb(err);
                    logger.verbose('Spiele deleted');

                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);

                        logger.verbose('Add Spiele');
                        return addSpiele(spiele, cb);
                    });
                });
            });
        });
    });
}

module.exports = {
    importSpiele: importSpiele
};