const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GruppenSchema = new mongoose.Schema({
    name: String,
    teams: [{type: Schema.ObjectId, ref: 'Team'}],
    jugend: {type: Schema.ObjectId, ref: 'Jugend'}
});

GruppenSchema.methods.pushTeams = function (team, cb) {
    this.teams.push(team);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
GruppenSchema.plugin(deepPopulate, {});

mongoose.model('Gruppe', GruppenSchema);