const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const async = require('async');
const cls = require('../config/cls.js');
const URLSlugs = require('mongoose-url-slugs');

let JugendSchema = new mongoose.Schema({
    name: String,
    gruppen: [{
        type: Schema.ObjectId,
        ref: 'Gruppe'
    }],
    teams: [{
        type: Schema.ObjectId,
        ref: 'Team'
    }],
    color: String,
    veranstaltung: {type: Schema.ObjectId, ref: 'Veranstaltung', required: true}
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

JugendSchema.plugin(URLSlugs('name', {update: true, indexUnique: false}));

JugendSchema.methods.pushGruppe = function (Gruppe, cb) {
    this.gruppen.push(Gruppe);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

JugendSchema.methods.removeGruppe = function (gruppe, cb) {
    const gruppen = this.gruppen;
    this.gruppen = gruppen.filter(function (single) {
        return single && single.toString() !== gruppe.toString();
    });
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

JugendSchema.methods.pushTeams = function (team, cb) {
    this.teams.push(team);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

JugendSchema.statics.removeTeam = function (jugendid, teamid, cb) {
    const self = this;
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return self.findById(jugendid, function (err, jugend) {
            if (err) return cb(err);

            const teams = jugend.teams;
            if (!teams) {
                return cb();
            }
            teams.splice(teams.indexOf(teamid), 1);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return self.update({'_id': jugendid}, {'teams': teams}, cb);
            });
        });
    });
};

JugendSchema.methods.fill = function (cb) {
    const self = this;
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return helper.fillOfEntity(self, 'teams', function (err, self) {
            if (err) return cb(err);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return helper.fillOfEntity(self, 'gruppen', cb);
            });
        });
    });
};

const deepPopulate = require('../config/mongoose-deep-populate')(mongoose);
JugendSchema.plugin(deepPopulate, {});

const helper = require('./helper.js');
JugendSchema = helper.applyBeachEventMiddleware(JugendSchema);
mongoose.model('Jugend', JugendSchema);