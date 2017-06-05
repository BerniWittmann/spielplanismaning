const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('../config/constants.js');
const async = require('async');
const cls = require('../config/cls.js');
const URLSlugs = require('mongoose-url-slugs');

let GruppenSchema = new mongoose.Schema({
    name: String,
    teams: [{type: Schema.ObjectId, ref: 'Team'}],
    jugend: {type: Schema.ObjectId, ref: 'Jugend'},
    type: {
        type: String,
        default: 'normal'
    },
    teamTabelle: [{type: Schema.ObjectId, ref: 'Team'}],
    veranstaltung: {type: Schema.ObjectId, ref: 'Veranstaltung', required: true}
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

GruppenSchema.plugin(URLSlugs('name', {update: true, indexUnique: true}));

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
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return self.findById(gruppenid, function (err, gruppe) {
            if (err) return cb(err);

            const teams = gruppe.teams;
            const index = teams.indexOf(oldTeam);
            if (index >= 0) {
                teams[index] = newTeam;
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return self.update({'_id': gruppenid}, {teams: teams}, cb);
                });
            }
            return cb();
        });
    });
};

GruppenSchema.methods.fill = function (cb) {
    const self = this;
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return helper.fillOfEntity(self, 'teams', function (err, gruppe) {
            if (err) return cb(err);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return helper.fillTabelle(gruppe, Spiel, cb);
            });
        });
    });
};

const deepPopulate = require('../config/mongoose-deep-populate')(mongoose);
GruppenSchema.plugin(deepPopulate, {});

const helper = require('./helper.js');
GruppenSchema = helper.applyBeachEventMiddleware(GruppenSchema);
mongoose.model('Gruppe', GruppenSchema);
const Spiel = mongoose.model('Spiel');