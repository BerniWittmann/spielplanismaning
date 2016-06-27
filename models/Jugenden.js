var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JugendSchema = new mongoose.Schema({
    name: String
    , gruppen: [{
        type: Schema.ObjectId
        , ref: 'Gruppe'
    }]
    , teams: [{
        type: Schema.ObjectId
        , ref: 'Team'
    }]
    , color: String
});

JugendSchema.methods.pushGruppe = function (Gruppe, cb) {
    this.gruppen.push(Gruppe);
    this.save(cb);
};

JugendSchema.methods.removeGruppe = function (gruppe, cb) {
    this.gruppen.splice(this.gruppen.indexOf(gruppe), 1);
    this.save(cb);
}

JugendSchema.methods.pushTeams = function (team, cb) {
    this.teams.push(team);
    this.save(cb);
}

var deepPopulate = require('mongoose-deep-populate')(mongoose);
JugendSchema.plugin(deepPopulate, {});

mongoose.model('Jugend', JugendSchema);