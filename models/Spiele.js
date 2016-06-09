var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SpielSchema = new mongoose.Schema({
	nummer: Number
	, platz: Number
	, uhrzeit: String //10:40
	, gruppe: {
		type: Schema.ObjectId
		, ref: 'Gruppe'
	}
	, jugend: {
		type: Schema.ObjectId
		, ref: 'Jugend'
	}
	, teamA: {
		type: Schema.ObjectId
		, ref: 'Team'
	}
	, teamB: {
		type: Schema.ObjectId
		, ref: 'Team'
	}
	, toreA: {
		type: Number
		, default: 0
	}
	, toreB: {
		type: Number
		, default: 0
	}
	, punkteA: {
		type: Number
		, default: 0
	}
	, punkteB: {
		type: Number
		, default: 0
	}
	, gewinner: {
		type: Schema.ObjectId
		, ref: 'Team'
	}
	, unentschieden: {
		type: Boolean
		, default: false
	}
	, beendet: {
		type: Boolean
		, default: false
	}
});

SpielSchema.methods.setTore = function (toreA, toreB, cb) {
	this.setToreA(toreA, function (err, spiel) {
		if (err) {
			throw err;
		}

		spiel.setToreB(toreB, function (err, spiel) {
			if (err) {
				throw err;
			}

			if (spiel.toreA > spiel.toreB) {
				spiel.setPunkte(2, 0, function (err, spiel) {
					if (err) {
						throw err;
					}

					spiel.save(cb);
				});
			} else if (spiel.toreA < spiel.toreB) {
				spiel.setPunkte(0, 2, function (err, spiel) {
					if (err) {
						throw err;
					}
					spiel.save(cb);
				});
			} else {
				spiel.setPunkte(1, 1, function (err, spiel) {
					if (err) {
						throw err;
					}
					spiel.save(cb);
				});
			}
		});
	});
}

SpielSchema.methods.setToreA = function (toreA, cb) {
	this.set('toreA', toreA);
	this.save(cb);
}

SpielSchema.methods.setToreB = function (toreB, cb) {
	this.set('toreB', toreB);
	this.save(cb);
}

SpielSchema.methods.setPunkte = function (punkteA, punkteB, cb) {
	this.setPunkteA(punkteA, function (err, spiel) {
		if (err) {
			throw err;
		}

		spiel.setPunkteB(punkteB, function (err, spiel) {
			if (err) {
				throw err;
			}

			if (spiel.punkteA == 2 && spiel.punkteB == 0) {
				spiel.unentschieden = false;
				spiel.gewinner = spiel.teamA;
			} else if (spiel.punkteA == 0 && spiel.punkteB == 2) {
				spiel.unentschieden = false;
				spiel.gewinner = spiel.teamB;
			} else {
				spiel.unentschieden = true;
			}
			spiel.beendet = true;
			spiel.save(cb);
		});
	});
};

SpielSchema.methods.setPunkteA = function (punkteA, cb) {
	this.set('punkteA', punkteA);
	this.save(cb);
}

SpielSchema.methods.setPunkteB = function (punkteB, cb) {
	this.set('punkteB', punkteB);
	this.save(cb);
}

mongoose.model('Spiel', SpielSchema);