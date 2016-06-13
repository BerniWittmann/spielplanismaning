var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TeamSchema = new mongoose.Schema({
	name: String
	, gruppe: {
		type: Schema.ObjectId
		, ref: 'Gruppe'
	}, jugend: {
		type: Schema.ObjectId,
		ref: 'Jugend'
	}
	, tore: {
		type: Number
		, default: 0
	}
	, gtore: {
		type: Number
		, default: 0
	}
	, punkte: {
		type: Number
		, default: 0
	}
	, gpunkte: {
		type: Number
		, default: 0
	}
});

TeamSchema.methods.setErgebnis = function (tore, toreAlt, gTore, gToreAlt, punkte, punkteAlt, gPunkte, gPunkteAlt, cb) {
	//console.log(tore + " " + toreAlt + " " + gTore + " " + gToreAlt + " " + punkte + " " + punkteAlt + " " + gPunkte + " " + gPunkteAlt);
	this.tore = this.tore + tore - toreAlt;
	this.gtore = this.gtore + gTore - gToreAlt;
	this.punkte = this.punkte + punkte - punkteAlt;
	this.gpunkte = this.gpunkte + gPunkte - gPunkteAlt;
	this.save(cb);
};

TeamSchema.methods.resetErgebnis = function (cb) {
	this.tore = 0;
	this.gtore = 0;
	this.punkte = 0;
	this.gpunkte = 0;
	this.save(cb);
};

TeamSchema.methods.changeName = function (name, cb) {
	this.name = name;
	this.save(cb);
}

var deepPopulate = require('mongoose-deep-populate')(mongoose);
TeamSchema.plugin(deepPopulate, {});

mongoose.model('Team', TeamSchema);