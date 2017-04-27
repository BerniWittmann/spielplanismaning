const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const async = require('async');

const JugendSchema = new mongoose.Schema({
    name: String,
    gruppen: [{
        type: Schema.ObjectId,
        ref: 'Gruppe'
    }],
    teams: [{
        type: Schema.ObjectId,
        ref: 'Team'
    }],
    color: String
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

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
    return self.findById(jugendid, function (err, jugend) {
        if (err) return cb(err);

        const teams = jugend.teams;
        if (!teams) {
            return cb();
        }
        teams.splice(teams.indexOf(teamid), 1);

        return self.update({'_id': jugendid}, {'teams': teams}, cb);
    });
};

JugendSchema.methods.fill = function (cb) {
    const self = this;
    return helper.fillOfEntity(self, 'teams', function (err, self) {
        if (err) return cb(err);

        return helper.fillOfEntity(self, 'gruppen', cb);
    });
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
JugendSchema.plugin(deepPopulate, {});

mongoose.model('Jugend', JugendSchema);
const helper = require('./helper.js');