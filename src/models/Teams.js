const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const async = require('async');
const _ = require('lodash');

const TeamSchema = new mongoose.Schema({
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
    }
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

TeamSchema.methods.changeName = function (name, cb) {
    //noinspection JSUnresolvedVariable
    this.name = name;
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

TeamSchema.methods.fill = function(callback) {
    const team = this;
    const results = {
        all: {},
        gruppe: {},
        zwischenGruppe: {}
    };
    return async.each([{
        key: 'all', value: undefined
    }, {
        key: 'gruppe', value: team.gruppe
    }, {
        key: 'zwischenGruppe', value: team.zwischengruppe
    }], function (gruppe, cb) {
       if (gruppe.value || gruppe.key === 'all') {
           return helpers.teamCalcErgebnisse(team, gruppe.value, function (err, res) {
              if (err) return cb(err);

              results[gruppe.key] = res;
              return cb();
           });
       }
       return cb();
    }, function (err) {
        if (err) return callback(err);

        team.set('ergebnisse', results);
        return callback(null, team);
    });
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
TeamSchema.plugin(deepPopulate, {});

mongoose.model('Team', TeamSchema);
const helpers = require('../routes/helpers.js');