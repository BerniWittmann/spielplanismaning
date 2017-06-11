const validationErrors = require('./validationErrors');
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const async = require('async');
const mongoose = require('mongoose');
const Gruppe = mongoose.model('Gruppe');
const Jugend = mongoose.model('Jugend');
const Team = mongoose.model('Team');
const cls = require('../../../config/cls.js');

const schema = Joi.object().keys({
    nummer: Joi.number().integer().min(1).required(),
    datum: Joi.date().format('DD.MM.YYYY').required(),
    uhrzeit: Joi.date().format('HH:mm').required(),
    platz: Joi.number().integer().min(1).max(parseInt(process.env.PLAETZE, 10) || 3).required(),
    turnier: Joi.string().required(),
    gruppe: Joi.string(),
    spielLabel: Joi.string(),
    teamA: Joi.string(),
    teamALabel: Joi.string(),
    teamB: Joi.string(),
    teamBLabel: Joi.string(),
    veranstaltung: Joi.string().optional(),
    toreA: Joi.number().integer().min(0).required(),
    toreB: Joi.number().integer().min(0).required(),
    punkteA: Joi.number().integer().min(0).required(),
    punkteB: Joi.number().integer().min(0).required()
}).or('gruppe', 'spielLabel').or('teamA', 'teamALabel').or('teamB', 'teamBLabel');

const requiredEntities = [{
    model: Jugend,
    key: 'turnier',
    required: true
}, {
    model: Gruppe,
    key: 'gruppe',
    required: false
}, {
    model: Team,
    key: 'teamA',
    required: false
}, {
    model: Team,
    key: 'teamB',
    required: false
}];

function checkEntity(config, spiel, index, cb) {
    if (!spiel[config.key]) {
        if (config.required) {
            return cb(validationErrors.fieldsInvalid(index, [{message: '"' + config.key + '" is required'}]));
        } else {
            return cb();
        }
    }

    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);

        return config.model.findOne({'slug': spiel[config.key]}, function (err, res) {
            if (err) return cb(err);

            if (!res) return cb(validationErrors.entityNotFound(index, config.key, spiel[config.key]), false);

            return cb(null, true);
        });
    });
}

function checkEntities(spiel, index, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);

        return async.each(requiredEntities, function (entityConfig, asyncdone) {
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return checkEntity(entityConfig, spiel, index, asyncdone);
            });
        }, cb);
    });
}

function validateSpiel(spiel, index, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);

        if (spiel) {
            spiel.veranstaltung = beachEventID;
        }

        if (!spiel) return cb(validationErrors.spielEmpty(index), false);
        const fieldValidationResult = Joi.validate(spiel, schema);
        if (fieldValidationResult.error) {
            return cb(validationErrors.fieldsInvalid(index, fieldValidationResult.error.details), false);
        }

        return checkEntities(spiel, index, cb);
    });
}

module.exports = {
    validateSpiel: validateSpiel
};