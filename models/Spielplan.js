var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SpielPlanSchema = new mongoose.Schema({
	startzeit: String //10:40	
		
	, spielzeit: Number
	, pausenzeit: Number
	, spiele: [
		{
			type: Schema.ObjectId
			, ref: 'Spiel'
		}
	]
	, ausnahmen: [
		{
			team1: {
				type: Schema.ObjectId
				, ref: 'Team'
			}
			, team2: {
				type: Schema.ObjectId
				, ref: 'Team'
			}
		}
	]
});

var deepPopulate = require('mongoose-deep-populate')(mongoose);
SpielPlanSchema.plugin(deepPopulate, {});

SpielPlanSchema.methods.addAusnahme = function (ausnahme, cb) {
	this.ausnahmen.add(ausnahme);
	this.save(cb);
};

SpielPlanSchema.methods.removeAusnahme = function (ausnahme, cb) {
	this.ausnahmen.splice(this.ausnahmen.indexOf(ausnahme), 1);
	this.save(cb);
};

mongoose.model('Spielplan', SpielPlanSchema);