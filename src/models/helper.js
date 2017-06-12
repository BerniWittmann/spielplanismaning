const async = require('async');
const logger = require('winston').loggers.get('model');
const cls = require('../config/cls.js');
const mongoose = require('mongoose');
const _ = require('lodash');

function fillOfEntity(entity, type, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return async.eachOf(entity[type], function (t, index, next) {
            if (t && t._id) {
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return t.fill(function (err, team) {
                        if (err) return cb(err);

                        entity[type][index] = team;
                        entity.set(type, entity[type]);
                        return next();
                    });
                });
            }
        }, function (err) {
            if (err) return cb(err);

            return cb(null, entity);
        });
    });
}

function fillTabelle(entity, spielModel, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        const key = entity.type === 'normal' ? 'gruppe' : 'zwischenGruppe';
        return sortTeams(entity.teams, key, spielModel, entity, function (err, teams) {
            if (err) return cb(err);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                entity.set('teamTabelle', teams);

                return cb(null, entity);
            });
        });
    });
}

function checkTeamInArray(arr, team) {
    return arr.find(function (single) {
        return single.a._id === team._id || single.b._id === team._id;
    });
}

function sortTeams(teams, key, spielModel, gruppe, cb) {
    if (!key) {
        key = 'all';
    }

    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        const teamsForDirektenVergleich = [];

        const sortedTeamsBase = teams.sort(function (a, b) {
            const ergebnisseA = a.ergebnisse && a.ergebnisse[key] ? a.ergebnisse[key] : {};
            const ergebnisseB = b.ergebnisse && b.ergebnisse[key] ? b.ergebnisse[key] : {};
            let result = ergebnisseA.punkte - ergebnisseB.punkte;
            if (result === 0) {
                result = ergebnisseB.gpunkte - ergebnisseA.gpunkte;
                if (result === 0) {
                    result = ergebnisseA.tore - ergebnisseB.tore;
                    if (result === 0) {
                        result = ergebnisseB.gtore - ergebnisseA.gtore;
                    }
                }
            }

            if (result === 0) {
                //Catch for direkten Vergleich
                teamsForDirektenVergleich.push({a: a, b: b});
            }
            return result * -1;
        });

        return async.sortBy(teams, function (team, next) {
            const index = sortedTeamsBase.indexOf(team) * 2;
            const direkterVergleich = checkTeamInArray(teamsForDirektenVergleich, team);
            if (!direkterVergleich) {
                return next(null, index);
            }

            let gegner;
            if (direkterVergleich.a._id.toString() === team._id.toString()) {
                gegner = direkterVergleich.b;
            } else {
                gegner = direkterVergleich.a;
            }

            const query = {
                $or: [{
                    beendet: true, gewinner: {$ne: null}, teamA: team._id, teamB: gegner._id
                }, {
                    beendet: true, gewinner: {$ne: null}, teamA: gegner._id, teamB: team._id
                }]
            };

            if (gruppe && gruppe._id) {
                query.$or[0].gruppe = gruppe._id.toString();
                query.$or[1].gruppe = gruppe._id.toString();
            }

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return spielModel.find(query).exec(function (err, spiele) {
                    if (err) return next(err);

                    let punkteTeam = 0;
                    let punkteGegner = 0;

                    spiele.forEach(function (spiel) {
                        if (spiel.gewinner.toString() === team._id.toString()) {
                            punkteTeam++;
                        } else {
                            punkteGegner++;
                        }
                    });

                    const indexGegner = sortedTeamsBase.indexOf(gegner);

                    let newIndex = index;
                    if (punkteTeam > punkteGegner && indexGegner < index) {
                        newIndex = indexGegner;
                    } else if (punkteTeam < punkteGegner && indexGegner > index) {
                        newIndex = indexGegner;
                    }

                    return next(null, newIndex);
                });
            });
        }, function (err, result) {
            if (err) return cb(err);

            return cb(null, result);
        });
    });
}

function beachEventQueryMiddleware() {
    const beachEventID = cls.getBeachEventID();
    if (!beachEventID) {
        if (_.includes(JSON.stringify(this.getQuery()), 'veranstaltung')) return;
        logger.error('No beachEventID given in Schema in ' + this.op + ' hook: ' + this.model.modelName);
        return;
    }
    const query = this && typeof this.getQuery === 'function' ? this.getQuery() : {};
    if (!query.slug || typeof query.slug === 'string') {
        this.where({veranstaltung: mongoose.Types.ObjectId(beachEventID)});
    }
}

function beachEventDocumentMiddleware(next) {
    const beachEventID = cls.getBeachEventID();
    if (!beachEventID && !this.veranstaltung) {
        logger.error('No beachEventID given in Schema in document hook: %s', JSON.stringify(this));
        return next();
    }
    let ID = beachEventID || this.veranstaltung;
    try {
        ID = mongoose.Types.ObjectId(ID);
    } catch(err) {
        ID = undefined;
    }
    if (!ID) {
        logger.error('No beachEventID given in Schema in document hook: %s', JSON.stringify(this));
        return next();
    }

    this.set({veranstaltung: ID});
    return next();
}

function beachEventDocumentRemoveMiddleware(next) {
    const beachEventID = cls.getBeachEventID();
    if (!beachEventID) {
        logger.error('No beachEventID given in Schema in document hook: %s', JSON.stringify(this));
        return next();
    }
    if (!this.veranstaltung || !beachEventID || this.veranstaltung.toString() !== beachEventID) {
        return next(new Error("Event ID is not valid or is not matching current context"));
    }

    return next();
}

function applyBeachEventMiddleware(schema) {
    schema.pre('find', beachEventQueryMiddleware);
    schema.pre('count', beachEventQueryMiddleware);
    schema.pre('findOne', beachEventQueryMiddleware);
    schema.pre('findOneAndRemove', beachEventQueryMiddleware);
    schema.pre('findOneAndUpdate', beachEventQueryMiddleware);
    schema.pre('insertMany', beachEventQueryMiddleware);
    schema.pre('update', beachEventQueryMiddleware);

    schema.pre('validate', beachEventDocumentMiddleware);
    schema.pre('save', beachEventDocumentMiddleware);
    schema.pre('remove', beachEventDocumentRemoveMiddleware);
    return schema;
}

module.exports = {
    fillOfEntity: fillOfEntity,
    fillTabelle: fillTabelle,
    sortTeams: sortTeams,
    beachEventMiddleware: beachEventQueryMiddleware,
    applyBeachEventMiddleware: applyBeachEventMiddleware
};