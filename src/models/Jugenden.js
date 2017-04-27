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
    return async.eachOf(self.teams, function (t, index, next) {
        if (t && t._id) {
            return t.fill(function (err, team) {
                if (err) return next(err);

                self.teams[index] = team;
                self.set('teams', self.teams);
                return next();
            });
        }
    }, function (err) {
        if (err) return cb(err);

        return async.eachOf(self.gruppen, function (g, index, next) {
            if (g && g._id) {
                return g.fill(function (err, gruppe) {
                    if (err) return next(err);

                    self.gruppen[index] = gruppe;
                    self.set('gruppen', self.gruppen);
                    return next();
                });
            }
        }, function (err) {
            if (err) return cb(err);

            return cb(null, self);
        });
    });
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
JugendSchema.plugin(deepPopulate, {});

mongoose.model('Jugend', JugendSchema);