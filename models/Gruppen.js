var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GruppenSchema = new mongoose.Schema({
	name: String
	, teams: [{ type: Schema.ObjectId, ref: 'Team'}]
	, jugend: {type: Schema.ObjectId, ref: 'Jugend'}
});

GruppenSchema.methods.addTeam = function (cb, team) {
	this.teams.push(team);
	this.save(cb);
};

mongoose.model('Gruppe', GruppenSchema);