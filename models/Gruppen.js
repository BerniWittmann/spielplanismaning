var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var GruppenSchema = new mongoose.Schema({
	name: String
	, teams: [{ type: Schema.ObjectId, ref: 'Team'}]
	, jugend: {type: Schema.ObjectId, ref: 'Jugend'}
});

GruppenSchema.methods.pushTeams = function(team, cb) {
	this.teams.push(team);
	this.save(cb);
}

var deepPopulate = require('mongoose-deep-populate')(mongoose);
GruppenSchema.plugin(deepPopulate, {});

mongoose.model('Gruppe', GruppenSchema);