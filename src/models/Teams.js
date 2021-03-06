const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const async = require('async');
const _ = require('lodash');
const logger = require('winston').loggers.get('model');
const request = require('request');
const moment = require('moment');
const helper = require('./helper.js');
const cls = require('../config/cls.js');
const URLSlugs = require('mongoose-url-slugs');

let TeamSchema = new mongoose.Schema({
    name: String,
    gruppe: {
        type: Schema.ObjectId,
        ref: 'Gruppe'
    },
    ergebnisse: {
        type: Schema.Types.Mixed
    },
    zwischengruppe: {
        type: Schema.ObjectId,
        ref: 'Gruppe'
    },
    jugend: {
        type: Schema.ObjectId,
        ref: 'Jugend'
    },
    from: {
        type: Schema.ObjectId,
        refPath: 'fromType'
    },
    fromType: String,
    rank: Number,
    isPlaceholder: {
        type: Boolean,
        default: false
    },
    anmeldungsId: String,
    anmeldungsObjectString: String,
    veranstaltung: {type: Schema.ObjectId, ref: 'Veranstaltung', required: true}
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

TeamSchema.plugin(URLSlugs('name', {update: false, indexUnique: true}));

TeamSchema.virtual('anmeldungsObject').get(function () {
    if (!this.anmeldungsObjectString || this.anmeldungsObjectString.length === 0) {
        return {};
    }
    return JSON.parse(this.anmeldungsObjectString);
});

TeamSchema.methods.changeName = function (name, cb) {
    //noinspection JSUnresolvedVariable
    this.name = name;
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

TeamSchema.methods.fill = function(callback) {
    const team = this;
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    const results = {
        all: {},
        gruppe: {},
        zwischenGruppe: {}
    };
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return async.each([{
            key: 'all', value: undefined
        }, {
            key: 'gruppe', value: team.gruppe
        }, {
            key: 'zwischenGruppe', value: team.zwischengruppe
        }], function (gruppe, cb) {
            if (gruppe.value || gruppe.key === 'all') {
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return helpers.teamCalcErgebnisse(team, gruppe.value, function (err, res) {
                        if (err) return cb(err);

                        results[gruppe.key] = res;
                        return cb();
                    });
                });
            }
            return cb();
        }, function (err) {
            if (err) return callback(err);

            team.set('ergebnisse', results);

            let getAnmeldungsObjectAgain = false;
            const anmeldungsObject = team.anmeldungsObjectString ? JSON.parse(team.anmeldungsObjectString) : undefined;
            if (!anmeldungsObject || _.isEmpty(anmeldungsObject)) {
                getAnmeldungsObjectAgain = true;
            } else {
                if (!anmeldungsObject.expires || moment().isAfter(moment(anmeldungsObject.expires, moment.ISO_8601))) {
                    getAnmeldungsObjectAgain = true;
                }
            }

            if (team.anmeldungsId && getAnmeldungsObjectAgain) {
                logger.verbose('Getting new AnmeldungsObject from Anmeldung for Team %s', team._id);
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return request(process.env.BEACHENMELDUNG_TEAM_URL + team.anmeldungsId + '/', function (err, status, body) {
                        if (err) {
                            logger.warn('Error when retrieving Team from Anmeldung', err);
                            return callback(null, team);
                        }

                        body = JSON.parse(body);

                        if (status.statusCode < 400 && body && body._id) {
                            _.assign(body, {'expires': moment().add(1, 'h').toISOString()});
                            team.anmeldungsObjectString = JSON.stringify(body);
                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);
                                return team.save(function (err, team) {
                                    if (err) {
                                        logger.warn(err);
                                    }

                                    return callback(null, team);
                                });
                            });
                        }
                        return callback(null, team);
                    });
                });
            }
            return callback(null, team);
        });
    });
};

TeamSchema = helper.applyBeachEventMiddleware(TeamSchema);

const deepPopulate = require('../config/mongoose-deep-populate')(mongoose);
TeamSchema.plugin(deepPopulate, {});

mongoose.model('Team', TeamSchema);
const helpers = require('../routes/helpers.js');