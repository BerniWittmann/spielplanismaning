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

JugendSchema.methods.addGruppe = function (cb, Gruppe) {
	this.gruppen.push(Gruppe);
	this.save(cb);
};

JugendSchema.methods.removeGruppe = function (gruppe, cb) {
	this.gruppen.splice(this.gruppen.indexOf(gruppe), 1);
	this.save(cb);
}

mongoose.model('Jugend', JugendSchema);