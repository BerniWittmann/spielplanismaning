var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

var Gruppe = mongoose.model('Gruppe');
var Jugend = mongoose.model('Jugend');
var Spiel = mongoose.model('Spiel');
var Spielplan = mongoose.model('Spielplan');
var Team = mongoose.model('Team');
var User = mongoose.model('User');

var auth = jwt({
	secret: 'SECRET'
	, userProperty: 'payload'
});


/* GET home page. */
router.get('/', function (req, res) {
	res.render('index');
});

/* Teams */

router.get('/teams', function (req, res, next) {
	var query = Team.find();

	query.populate('gruppe').populate('jugend').exec(function (err, teams) {
		if (err) {
			throw err;
		}

		res.json(teams);
	});
});

router.delete('/teams/:team', function (req, res) {
	req.team.jugend.teams.splice(req.team.jugend.teams.indexOf(req.team), 1);
	req.team.jugend.save(function (err, jugend) {
		if (err) {
			throw err;
		}

		req.team.gruppe.teams.splice(req.team.gruppe.teams.indexOf(req.team), 1);
		req.team.gruppe.save(function (err, gruppe) {
			if (err) {
				throw err;
			}

			Team.remove({
				"_id": req.team
			}, function (err) {
				if (err) {
					throw err;
				}

				res.json("success");
			});
		});
	});
})

router.post('/jugenden/:jugend/gruppen/:gruppe/teams', function (req, res, next) {
	var team = new Team(req.body);
	team.jugend = req.jugend._id;
	team.gruppe = req.gruppe._id;

	team.save(function (err, team) {
		if (err) {
			throw err;
		}

		req.gruppe.teams.push(team);
		req.gruppe.save(function (err, gruppe) {
			if (err) {
				throw err;
			}

			req.jugend.teams.push(team);
			req.jugend.save(function (err, jugend) {
				if (err) {
					throw err;
				}

				res.json(team);
			})
		});
	});
});

router.param('team', function (req, res, next, id) {
	var query = Team.findById(id);

	query.populate('jugend').populate('gruppe').exec(function (err, team) {
		if (err) {
			throw err;
		}
		if (!team) {
			return next(new Error('can\'t find Team'));
		}

		req.team = team;
		return next();
	});
});

router.get('/teams/:team', function (req, res) {
	res.json(req.team);
});

router.get('/jugenden/:jugend/gruppen/:gruppe/teams', function (req, res, next) {
	var query = Team.find({
		"gruppe": req.gruppe
		, "jugend": req.jugend
	});

	query.populate('jugend').populate('gruppe').exec(function (err, team) {
		if (err) {
			throw err;
		}
		if (!team) {
			return next(new Error('can\'t find Team'));
		}

		res.json(team);
	});
});

router.put('/teams/resetErgebnisse', function (req, res, next) {
	var query = Team.find({});
	query.exec(function (err, teams) {
		if (err) {
			throw err;
		}

		for (var i = 0; i < teams.length; i++) {
			var team = teams[i];
			team.resetErgebnis(function (err, team) {
				if (err) {
					throw err;
				}
			})
		}
		res.json('Successful Reset');
	});
});

router.put('/teams/:team', function (req, res) {
	var team = req.team;
	team.name = req.body.name;
	team.save(function (err, team) {
		if (err) {
			throw err;
		}

		res.json(team);
	});
});

/* Gruppen */

router.get('/jugenden/:jugend/gruppen', function (req, res, next) {
	var query = Gruppe.find({
		"jugend": req.jugend
	});

	query.populate('jugend').populate('teams').exec(function (err, gruppe) {
		if (err) {
			throw err;
		}
		if (!gruppe) {
			return next(new Error('can\'t find Gruppe'));
		}

		res.json(gruppe);
	});
});

router.post('/jugenden/:jugend/gruppen', function (req, res, next) {
	var gruppe = new Gruppe(req.body);
	gruppe.jugend = req.jugend._id;
	var query = Jugend.findById(gruppe.jugend);

	query.exec(function (err, jugend) {
		if (jugend.gruppen.length >= 4) {
			return res.status(418).json({
				message: 'Maximalzahl an Gruppen für diese Jugend erreicht'
			});
		} else {
			gruppe.save(function (err, gruppe) {
				if (err) {
					throw err;
				}

				req.jugend.gruppen.push(gruppe);
				req.jugend.save(function (err, jugend) {
					if (err) {
						throw err;
					}

					res.json(gruppe);
				})
			});
		}

	});
});

router.param('gruppe', function (req, res, next, id) {
	var query = Gruppe.findById(id);

	query.populate('jugend').populate('teams').exec(function (err, gruppe) {
		if (err) {
			throw err;
		}
		if (!gruppe) {
			return next(new Error('can\'t find Gruppe'));
		}

		req.gruppe = gruppe;
		return next();
	});
});

router.get('/gruppen/:gruppe', function (req, res) {
	res.json(req.gruppe);
});

router.delete('/gruppen/:gruppe', function (req, res) {
	var jugend = req.gruppe.jugend;
	jugend.removeGruppe(req.gruppe, function (err, jugend) {
		if (err) {
			throw err;
		}

		Team.remove({
			"gruppe": req.gruppe
		}, function (err) {
			if (err) {
				throw err;
			}

			Gruppe.remove({
				"_id": req.gruppe
			}, function (err) {
				if (err) {
					throw err;
				}

				res.json("success");
			});
		});
	});
});

router.get('/gruppen', function (req, res) {
	var query = Gruppe.find();
	query.populate('jugend').populate('teams').exec(function (err, gruppen) {
		if (err) {
			throw err;
		}

		res.json(gruppen);
	});
});
/* Jugenden */

router.get('/jugenden', function (req, res, next) {
	var query = Jugend.find();
	query.populate('teams').populate({
		path: 'gruppen'
		, populate: {
			path: 'teams'
		}
	}).exec(function (err, jugenden) {
		if (err) {
			throw err;
		}

		var options = {
			path: 'gruppen.teams'
			, model: 'Team'
		};
		Jugend.populate(jugenden, options, function (err, jugenden) {
			if (err) {
				throw err;
			}

			res.json(jugenden);
		})
	});
});

router.post('/jugenden', function (req, res, next) {
	var jugend = new Jugend(req.body);

	jugend.save(function (err, jugend) {
		if (err) {
			throw err;
		}
		var gruppe = new Gruppe({
			name: "Gruppe A"
			, jugend: jugend._id
		});

		gruppe.save(function (err, gruppe) {
			if (err) {
				throw err;
			}

			jugend.gruppen.push(gruppe._id);

			jugend.save(function (err, jugend) {
				if (err) {
					throw err;
				}

				res.json(jugend);
			});
		});
	});
});

router.param('jugend', function (req, res, next, id) {
	var query = Jugend.findById(id);

	query.populate('teams').populate('gruppen').exec(function (err, jugend) {
		if (!jugend) {
			return next(new Error('can\'t find Jugend'));
		}

		Jugend.populate(jugend, {
			path: 'gruppen.teams'
			, model: 'Team'
		}, function (err, jugend) {
			if (err) {
				throw err;
			}
			req.jugend = jugend;
			return next();
		});
	});
});

router.get('/jugenden/:jugend', function (req, res) {
	res.json(req.jugend);
});

router.delete('/jugenden/:jugend', function (req, res) {
	Team.remove({
		"jugend": req.jugend
	}, function (err) {
		if (err) {
			throw err;
		}

		Gruppe.remove({
			"jugend": req.jugend
		}, function (err) {
			if (err) {
				throw err;
			}

			Jugend.remove({
				"_id": req.jugend
			}, function (err) {
				if (err) {
					throw err;
				}
				res.json(req.jugend);
			});
		});
	});
});

router.get('/jugenden/:jugend/tore', function (req, res) {
	var tore = 0;
	var teams = req.jugend.teams;
	for (var i = 0; i < teams.length; i++) {
		tore += teams[i].tore;
	}
	res.json(tore);
});

/* Spiele */

router.get('/spiele', function (req, res, next) {
	var query = Spiel.find();
	query.populate('gruppe').populate('jugend').populate('teamA').populate('teamB').exec(function (err, spiele) {
		if (err) {
			throw err;
		}

		res.json(spiele);
	});
});

router.post('/spiele', function (req, res, next) {
	var spiel = new Spiel(req.body);
	spiel.jugend = req.body.jugend;
	spiel.gruppe = req.body.gruppe;

	spiel.save(function (err, spiel) {
		if (err) {
			throw err;
		}

		res.json(spiel);
	});
});

router.get('/jugenden/:jugend/gruppen/:gruppe/spiele', function (req, res, next) {
	var query = Spiel.find({
		jugend: req.jugend
		, gruppe: req.gruppe
	});
	query.populate('gruppe').populate('jugend').populate('teamA').populate('teamB').exec(function (err, spiele) {
		if (err) {
			throw err;
		}

		res.json(spiele);
	});
});

router.get('/jugenden/:jugend/spiele', function (req, res, next) {
	var query = Spiel.find({
		jugend: req.jugend
	});
	query.populate('gruppe').populate('jugend').populate('teamA').populate('teamB').exec(function (err, spiele) {
		if (err) {
			throw err;
		}

		res.json(spiele);
	});
});

router.get('/teams/:team/spiele', function (req, res, next) {
	var query = Spiel.find({}).or([{
		teamA: req.team
	}, {
		teamB: req.team
	}]);
	query.populate('gruppe').populate('jugend').populate('teamA').populate('teamB').exec(function (err, spiele) {
		if (err) {
			throw err;
		}

		res.json(spiele);
	});
});

router.param('spiel', function (req, res, next, id) {
	var query = Spiel.findById(id);

	query.populate('gruppe').populate('jugend').populate('teamA').populate('teamB').populate('gewinner').exec(function (err, spiel) {
		if (err) {
			throw err;
		}
		if (!spiel) {
			return next(new Error('can\'t find Spiel'));
		}

		req.spiel = spiel;
		return next();
	});
});

router.get('/spiele/:spiel', function (req, res) {
	res.json(req.spiel);
});

router.delete('/spiele/:spiel', function (req, res) {
	Spiel.remove({
		"_id": req.spiel
	}, function (err) {
		if (err) {
			throw err;
		}

		res.json('success');
	});
});

router.put('/spiele/:spiel/tore', function (req, res) {
	var toreAOld = req.spiel.toreA;
	var toreBOld = req.spiel.toreB;
	var punkteAOld = req.spiel.punkteA;
	var punkteBOld = req.spiel.punkteB;
	var spiel = req.spiel;
	spiel.setTore(req.body.toreA, req.body.toreB, function (err, spiel) {
		if (err) {
			throw err;
		}

		//Set Ergebnis Team A
		spiel.teamA.setErgebnis(req.body.toreA, toreAOld, req.body.toreB, toreBOld, spiel.punkteA, punkteAOld, spiel.punkteB, punkteBOld, function (err, teamA) {
			if (err) {
				throw err;
			}

			//Set Ergebnis Team B
			spiel.teamB.setErgebnis(req.body.toreB, toreBOld, req.body.toreA, toreAOld, spiel.punkteB, punkteBOld, spiel.punkteA, punkteAOld, function (err, teamB) {
				if (err) {
					throw err;
				}

			});
		})

		res.json(spiel);

	});
});

router.delete('/spiele', function (req, res) {
	Spiel.remove({}, function (err) {
		if (err) {
			throw err;
		}

		res.json('success');
	});
});

/* Spielplan */

router.get('/spielplan', function (req, res, next) {
	var query = Spielplan.findOne({});
	query.exec(function (err, spielplan) {
		if (err) {
			throw err;
		}
		res.json(spielplan);
	});
});

router.put('/spielplan/zeiten', function (req, res, next) {
	Spielplan.findOneAndUpdate({}, req.body, {
		upsert: true
	}, function (err, doc) {
		if (err) return res.send(500, {
			error: err
		});
		return res.send("succesfully saved");
	});
});

/* Users */

router.post('/register', function (req, res, next) {
	if (!req.body.username || !req.body.password) {
		return res.status(400).json({
			message: 'Please fill out all fields'
		});
	}

	var user = new User();

	user.username = req.body.username;

	user.setPassword(req.body.password)

	user.save(function (err) {
		if (err) {
			throw err;
		}


		return res.json({
			token: user.generateJWT()
		});

	});
});

router.post('/login', function (req, res, next) {
	if (!req.body.username || !req.body.password) {
		return res.status(400).json({
			message: 'Please fill out all fields'
		});
	}

	passport.authenticate('local', function (err, user, info) {
		if (err) {
			throw err;
		}

		if (user) {
			return res.json({
				token: user.generateJWT()
			});
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

module.exports = router;