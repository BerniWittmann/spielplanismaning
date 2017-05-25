module.exports = function () {
    const logger = require('winston').loggers.get('spielplanGenerator');
    const moment = require('moment');
    const async = require('async');
    const _ = require('lodash');
    const helper = require('./helper.js');
    const helpers = require('../helpers.js');
    const spielLabels = require('./spielLabels.js');
    const cls = require('../../config/cls.js');

    const spielplanGenerator = {};

    function loadDataFromHelper(functionName, varKey, store, callback) {
        logger.verbose('Loading %s', varKey);
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return helper[functionName](function (err, data) {
                if (err) return callback(err);
                store[varKey] = data;
                return callback();
            });
        });
    }

    function generate(payload, cb) {
        logger.verbose('Generator Started');

        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return require('./generateGruppenPhase.js')(payload, function (err, spiele) {
                if (err) return cb(err);

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    spiele = helper.fillLastEmptySpiele(spiele, payload.zeiten, spielLabels.NORMAL);

                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        return require('./generateEndRunde.js')({
                            spiele: spiele,
                            gruppen: payload.gruppen,
                            zeiten: payload.zeiten
                        }, function (err, spiele) {
                            if (err) return cb(err);

                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);
                                spiele = helper.fillLastEmptySpiele(spiele, payload.zeiten, spielLabels.NORMAL);

                                return cb(null, spiele);
                            });
                        });
                    });
                });
            });
        });
    }

    function create(payload, keep, cb) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return generate(payload, function (err, spiele) {
                if (err || !spiele) {
                    logger.error('Generator errored', err);
                    return cb(err);
                }

                logger.info('Spielplan-Generator generated %d Spiele', spiele.length);
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return helper.updateAllSpiele(spiele, keep, function (err) {
                        if (err) return cb(err);
                        logger.verbose('Saved All Games');

                        return cb();
                    });
                });
            });
        });
    }

    spielplanGenerator.generateNew = function (cb) {
        logger.verbose('Generate a complete new Spielplan');
        const data = {};
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return helper.removeZwischenRundenGruppenUndSpiele(function (err) {
            if (err) return cb(err);
            return async.parallel([
                function (callback) {
                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        loadDataFromHelper('getZeiten', 'zeiten', data, callback);
                    });
                },
                function (callback) {
                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        loadDataFromHelper('getGruppen', 'gruppen', data, callback);
                    });
                }
            ], function (err) {
                if (err) return cb(err);

                if (!data.gruppen || data.gruppen.length === 0) {
                    logger.warn('Keine Gruppen für Spielplanerstellung gefunden');
                    return cb();
                }

                if (!data.zeiten) {
                    logger.warn('Keine Zeiten für Spielplanerstellung gefunden');
                    return cb();
                }

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return create({
                        zeiten: data.zeiten,
                        gruppen: data.gruppen,
                        spiele: [],
                        lastPlayingTeams: [],
                        geradeSpielendeTeams: [],
                        i: 1
                    }, false, cb);
                });
            });
        });
    };

    spielplanGenerator.regenerate = function (cb) {
        logger.verbose('Generate Spielplan with keeping completed games');
        const data = {};
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return helper.checkEndrundeStarted(function (err, result) {
                if (err) return cb(err);

                if (result) {
                    logger.warn('Endrunde already started - not able to keep spiele.');
                    return cb('Endrunde already started - not able to keep spiele.');
                }

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return helper.removeZwischenRundenGruppenUndSpiele(function (err) {
                        if (err) return cb(err);
                        return async.parallel([
                            function (callback) {
                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    loadDataFromHelper('getZeiten', 'zeiten', data, callback);
                                });
                            },
                            function (callback) {
                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    loadDataFromHelper('getGruppen', 'gruppen', data, callback);
                                });
                            },
                            function (callback) {
                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    loadDataFromHelper('getAllSpiele', 'spiele', data, callback);
                                });
                            }
                        ], function (err) {
                            if (err) return cb(err);

                            if (!data.gruppen || data.gruppen.length === 0) {
                                logger.warn('Keine Gruppen für Spielplanerstellung gefunden');
                                return cb();
                            }

                            const presetData = helper.calculatePresetSpielplanData(data);

                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);
                                return create({
                                    zeiten: data.zeiten,
                                    gruppen: data.gruppen,
                                    spiele: presetData.spiele,
                                    lastPlayingTeams: presetData.lastPlayingTeams,
                                    geradeSpielendeTeams: presetData.geradeSpielendeTeams,
                                    i: presetData.i
                                }, true, cb);
                            });
                        });
                    });
                });
            });
        });
    };

    return spielplanGenerator;
};