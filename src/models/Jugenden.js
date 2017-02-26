const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
});

JugendSchema.methods.pushGruppe = function (Gruppe, cb) {
    this.gruppen.push(Gruppe);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

JugendSchema.methods.removeGruppe = function (gruppe, cb) {
    this.gruppen.splice(this.gruppen.indexOf(gruppe), 1);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

JugendSchema.methods.pushTeams = function (team, cb) {
    this.teams.push(team);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
JugendSchema.plugin(deepPopulate, {});

mongoose.model('Jugend', JugendSchema);