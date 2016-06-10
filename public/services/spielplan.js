angular
	.module('spi.spielplan', ['spi.auth', 'spi.spiel', 'spi.gruppe', 'spi.team']).factory('spielplan', ['$http', '$q', 'auth', 'spiel', 'gruppe', 'team', 'Logger', function ($http, $q, auth, spiel, gruppe, team, Logger) {

		var spielplan = {
			startzeit: undefined
			, spielzeit: undefined
			, pausenzeit: undefined
			, spiele: []
			, progress: 0
			, maxProgress: 0
		};

		var lastPlayingTeams;
		var i;
		var spieleGesamt;
		var platz;
		var plätze = 3;
		var zeit;

		var spielplanerstellungRunning = false;

		spielplan.getZeiten = function () {
			return $http.get('/spielplan').success(function (data) {
				if (!_.isUndefined(data) && !_.isNull(data)) {
					spielplan.startzeit = moment(data.startzeit, 'HH:mm');
					spielplan.spielzeit = data.spielzeit;
					spielplan.pausenzeit = data.pausenzeit;
					zeit = spielplan.startzeit;
				} else {
					spielplan.startzeit = "09:00";
					spielplan.spielzeit = 8;
					spielplan.pausenzeit = 2;
				}

				return spielplan.data;
			});
		};

		spielplan.saveZeiten = function (zeiten) {
			return $http.put('/spielplan/zeiten', zeiten, {
				headers: {
					Authorization: 'Bearer ' + auth.getToken()
				}
			}).success(function (data) {
				spielplan.createSpielplan();
				return data;
			});
		};

		spielplan.createSpielplan = function () {
			spielplanerstellungRunning = true;
			spielplan.progress = 0;
			spielplan.getZeiten();
			spiel.deleteAll();
			spielplan.spiele = [];
			team.resetErgebnisse();
			return gruppe.getAll().then(function (gruppen) {
				spieleGesamt = calcSpieleGesamt(gruppen.data);
				Logger.log('Spielplanerstellung: Anzahl Spiele: ' + spieleGesamt);
				spielplan.maxProgress = spieleGesamt + 1;

				lastPlayingTeams = [];
				geradeSpielendeTeams = [];
				i = 1;
				platz = 3; //Bei 3 anfangen macht calcPlatz einfacher

				var defer = $q.defer();
				var promises = [];
				var leerdurchgelaufeneGruppen = 0;

				while (i <= spieleGesamt) {
					leerdurchgelaufeneGruppen = 0;
					_.forEach(gruppen.data, function (gruppe) {
						if (checkSpieleFürGruppeÜbrig(gruppe)) {
							Logger.log('Spielerstellung Nr. ' + i + ': gestartet');

							var teamA = getTeamWithoutLast(gruppe);
							if (!_.isUndefined(teamA)) {
								addLastTeam(teamA);
								Logger.log('Spielerstellung Nr. ' + i + ': TeamA gewählt: ' + teamA.name);

								var teamB = getPossibleGegner(gruppe, teamA);
								if (!_.isUndefined(teamB)) {
									addLastTeam(teamB);
									Logger.log('Spielerstellung Nr. ' + i + ': TeamB gewählt: ' + teamB.name);

									var platz = calcPlatz();
									Logger.log('Spielerstellung Nr. ' + i + ': Platz vergeben: ' + platz);

									var zeit = calcZeit(platz);
									Logger.log('Spielerstellung Nr. ' + i + ': Spielzeit angesetzt: ' + zeit);

									var neuesSpiel = {
										nummer: i
										, platz: platz
										, uhrzeit: zeit
										, gruppe: gruppe._id
										, jugend: gruppe.jugend._id
										, teamA: teamA._id
										, teamB: teamB._id
									};

									promises.push($http.post('/spiele', neuesSpiel));
									spielplan.spiele.push(neuesSpiel);
									Logger.log('Spielplanerstellung: Spiel Nr.' + i + ' für Gruppe ' + gruppe.name + ' erstellt.');
									i++;
									spielplan.progress++;
									if (i > 1 && (i - 1) % 3 == 0) {
										lastPlayingTeams = geradeSpielendeTeams
										geradeSpielendeTeams = [];
									}
								} else {
									leerdurchgelaufeneGruppen++;
								}
							} else {
								leerdurchgelaufeneGruppen++;
							}
						} else {
							leerdurchgelaufeneGruppen++;
						}
					});
					if (leerdurchgelaufeneGruppen == gruppen.data.length) {
						//Leeres Spiel
						Logger.log('Spielplanerstellung: Spiel Nr.' + i + ': Leeres Spiel');
						var leeresSpiel = {
							nummer: i
							, platz: calcPlatz()
							, uhrzeit: calcZeit()
						}
						promises.push($http.post('spiele', leeresSpiel));
						spielplan.spiele.push(leeresSpiel);
						i++;
						spieleGesamt++;
						spielplan.progress++;
						spielplan.maxProgress++;
						if (i > 1 && (i - 1) % 3 == 0) {
							lastPlayingTeams = geradeSpielendeTeams
							geradeSpielendeTeams = [];
						}
					}
				}

				if (_.last(spielplan.spiele).platz == 1) {
					for (var j = 0; j < 2; j++) {
						Logger.log('Spielplanerstellung: Spiel Nr.' + i + ': Leeres Spiel');
						var leeresSpiel = {
							nummer: i
							, platz: calcPlatz()
							, uhrzeit: calcZeit()
						}
						promises.push($http.post('spiele', leeresSpiel));
						spielplan.spiele.push(leeresSpiel);
						i++;
						spieleGesamt++;
						spielplan.progress++;
						spielplan.maxProgress++;
						if (i > 1 && (i - 1) % 3 == 0) {
							lastPlayingTeams = geradeSpielendeTeams
							geradeSpielendeTeams = [];
						}
					}
				} else if (_.last(spielplan.spiele).platz == 2) {
					Logger.log('Spielplanerstellung: Spiel Nr.' + i + ': Leeres Spiel');
					var leeresSpiel = {
						nummer: i
						, platz: calcPlatz()
						, uhrzeit: calcZeit()
					}
					promises.push($http.post('spiele', leeresSpiel));
					spielplan.spiele.push(leeresSpiel);
					i++;
					spieleGesamt++;
					spielplan.progress++;
					spielplan.maxProgress++;
					if (i > 1 && (i - 1) % 3 == 0) {
						lastPlayingTeams = geradeSpielendeTeams
						geradeSpielendeTeams = [];
					}
				}
				
				spielplan.maxProgress++;
				return $q.all(promises).then(pushSpiele, function (err) {
					console.log(err);
				});

				function pushSpiele() {
					Logger.log('Alle Spiele gespeichert');
					spiel.getAll().then(function (spiele) {
						spielplan.spiele = spiele;
					});

					spielplan.progress = spielplan.maxProgress;
					spielplanerstellungRunning = false;
				}
			});
		}

		function calcSpieleGesamt(gruppen) {
			var sum = 0
			_.forEach(gruppen, function (gruppe) {
				var n = gruppe.teams.length;
				sum += (n * (n - 1)) / 2;
			})

			return sum;
		}

		function getTeamWithoutLast(gruppe) {
			var teams = [];
			_.extend(teams, gruppe.teams);
			_.pullAllBy(teams, geradeSpielendeTeams, '_id');

			var moeglTeams = [];
			_.extend(moeglTeams, teams);

			_.pullAllBy(teams, lastPlayingTeams, '_id');
			if (teams.length == 0) {
				teams = moeglTeams;
			}

			if (teams.length == 0) {
				//Empty Game
				return undefined;
			}
			return chooseTeam(teams);
		}

		function chooseTeam(teams) {
			if (_.size(teams) === 0) {
				return undefined;
			}
			var team = _.head(teams);
			spieleTeam = getSpieleByTeam(team);
			_.forEach(teams, function (t) {
				spieleT = getSpieleByTeam(t);

				if (spieleT.length < spieleTeam.length) {
					team = t;
					spieleTeam = getSpieleByTeam(team);
				} else if (spieleT.length === spieleTeam.length) {
					//Randomly choose one
					team = _.head(_.shuffle([team, t]));
					spieleTeam = getSpieleByTeam(team);
				}
			});
			return team;
		}

		function getPossibleGegner(gruppe, team) {
			var alle = [];
			_.extend(alle, gruppe.teams);

			_.pullAllBy(alle, geradeSpielendeTeams, '_id');

			var spiele = getSpieleByTeam(team);
			var bereitsgespielt = [team];
			_.forEach(spiele, function (spiel) {
				if (_.isEqual(spiel.teamA, team._id)) {
					bereitsgespielt.push({
						_id: spiel.teamB
					});
				} else if (_.isEqual(spiel.teamB, team._id)) {
					bereitsgespielt.push({
						_id: spiel.teamA
					});
				}
			});
			_.pullAllBy(alle, bereitsgespielt, '_id');

			var möglicheGegner = [];
			_.extend(möglicheGegner, alle);

			_.pullAllBy(möglicheGegner, lastPlayingTeams, '_id');
			if (möglicheGegner.length == 0) {
				möglicheGegner = alle;
			}
			return chooseTeam(möglicheGegner);
		}

		function addLastTeam(team) {
			geradeSpielendeTeams.push(team);
		}

		function calcZeit(platz) {
			if (i > 1 && platz == 1) {
				zeit = zeit.add(spielplan.spielzeit + spielplan.pausenzeit, 'm');
			}
			return zeit.format('HH:mm');

		}

		function calcPlatz() {
			platz++;
			if (platz > plätze) {
				platz = 1;
			}
			return platz;
		}

		function getSpieleByTeam(team) {
			return _.filter(spielplan.spiele, function (o) {
				return _.isEqual(o.teamA, team._id) || _.isEqual(o.teamB, team._id);
			});
		}

		function getSpieleByGruppe(gruppe) {
			return _.filter(spielplan.spiele, function (o) {
				return _.isEqual(o.gruppe, gruppe._id);
			})
		}

		function checkSpieleFürGruppeÜbrig(gruppe) {
			var max = (gruppe.teams.length * (gruppe.teams.length - 1) / 2);
			var result = getSpieleByGruppe(gruppe).length;
			return result < max;
		}

		window.onbeforeunload = function () {
			if (spielplanerstellungRunning) {
				return "Achtung! Spielplan wird gerade erstellt! Es verbleiben noch " + Math.round(spielplan.progress / spielplan.maxProgress) + "%. Bitte schließen Sie die Seite noch nicht!";
			}
		}

		return spielplan;
}]);