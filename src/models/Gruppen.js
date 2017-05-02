const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('../config/constants.js');
const async = require('async');

const GruppenSchema = new mongoose.Schema({
    name: String,
    teams: [{type: Schema.ObjectId, ref: 'Team'}],
    jugend: {type: Schema.ObjectId, ref: 'Jugend'},
    type: {
        type: String,
        default: 'normal'
    },
    teamTabelle: [{type: Schema.ObjectId, ref: 'Team'}]
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

GruppenSchema.methods.pushTeams = function (team, cb) {
    this.teams.push(team);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

GruppenSchema.methods.setType = function (type) {
    this.type = _.includes(constants.GRUPPEN_TYPES, type) ? type : undefined;
};

GruppenSchema.statics.updateTeamInGruppe = function (gruppenid, oldTeam, newTeam, cb) {
    const self = this;
    return self.findById(gruppenid, function (err, gruppe) {
        if (err) return cb(err);

        const teams = gruppe.teams;
        const index = teams.indexOf(oldTeam);
        if (index >= 0) {
            teams[index] = newTeam;
            return self.update({'_id': gruppenid}, {teams: teams}, cb);
        }
        return cb();
    });
};

GruppenSchema.methods.fill = function (cb) {
    const self = this;
    return helper.fillOfEntity(self, 'teams', function (err, gruppe) {
        if (err) return cb(err);

        return helper.fillTabelle(gruppe, Spiel, cb);
    });
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
GruppenSchema.plugin(deepPopulate, {});

mongoose.model('Gruppe', GruppenSchema);
const helper = require('./helper.js');
const Spiel = mongoose.model('Spiel');