(function () {
    'use strict';

    angular
        .module('spi.spiel', ['spi.routes', 'spi.team', 'toastr'])
        .factory('spiel', ['Logger', 'routes', 'team', '$rootScope', 'toastr', function (Logger, routes, team, $rootScope, toastr) {
            function isSpielplanEnabled() {
                return $rootScope.spielplanEnabled;
            }

            const spiel = {};

            let teams;

            function loadTeams() {
                team.getAll().then(function (res) {
                    teams = res;
                }).catch(function (err) {
                    console.warn(err);
                });
            }

            loadTeams();

            spiel.getAll = function () {
                loadTeams();
                return routes.requestGETBase('spiele');
            };

            spiel.create = function (spiel) {
                if (!isSpielplanEnabled()) return;
                return routes.requestPOST(routes.urls.spiele.base(), spiel);
            };

            function getByParam(param, id) {
                loadTeams();
                const params = {};
                params[param] = id;
                return routes.requestGETBaseParam('spiele', params);
            }

            spiel.get = function (id) {
                return getByParam('id', id);
            };

            spiel.getBySlugOrID = function (identifier) {
                return getByParam('identifier', identifier);
            };

            spiel.getByGruppe = function (gruppenid) {
                return getByParam('gruppe', gruppenid);
            };

            spiel.getByJugend = function (jugendid) {
                return getByParam('jugend', jugendid);
            };

            spiel.getByTeam = function (teamid) {
                return getByParam('team', teamid);
            };

            spiel.delete = function (spielid) {
                if (!isSpielplanEnabled()) return;
                return routes.requestDELETE(routes.urls.spiele.base(), spielid);
            };

            spiel.deleteAll = function () {
                if (!isSpielplanEnabled()) return;
                return routes.requestMethod('DELETE', routes.urls.spiele.alle());
            };

            spiel.updateTore = function (spiel) {
                if (!isSpielplanEnabled()) return;
                Logger.log('Tore für Spiel #' + spiel.nummer + ' geändert!');
                return routes.requestPUTID(routes.urls.spiele.tore(), spiel._id, spiel);
            };

            spiel.resetSpiel = function (spiel) {
                if (!isSpielplanEnabled()) return;
                return routes.requestDELETE(routes.urls.spiele.tore(), spiel._id);
            };

            spiel.updateOrder = function (spiele) {
                if (!isSpielplanEnabled()) return;
                return routes.requestPUT(routes.urls.spiele.order(), spiele);
            };

            spiel.getTeamDisplay = function (game, teamStr) {
                if (game['team' + teamStr]) {
                    if (game['team' + teamStr].isPlaceholder && !game['team' + teamStr].name) {
                        const t = teams.find(function (single) {
                            return single._id.toString() === game['team' + teamStr]._id.toString();
                        });
                        if (t && t.from) {
                            return game['team' + teamStr].rank + '. ' + t.from.name;
                        }
                    }
                    return game['team' + teamStr].name;
                } else if (game['from' + teamStr]) {
                    if (game.fromType === 'Spiel') {
                        let winOrLose;
                        if (game['rank' + teamStr] > 0) {
                            winOrLose = 'Gewinner';
                        } else {
                            winOrLose = 'Verlierer';
                        }
                        return winOrLose + ' Spiel ' + game['from' + teamStr].nummer;
                    }
                    return game['rank' + teamStr] + '. ' + game['from' + teamStr].name;
                } else if (game['team' + teamStr + 'Label']) {
                    return game['team' + teamStr + 'Label'];
                } else {
                    return '';
                }
            };

            spiel.getGruppeDisplay = function (game) {
                if (game.label && game.label !== 'Zwischenrunde' && game.label !== 'Spiel') {
                    return game.label;
                } else if (game.gruppe) {
                    return game.gruppe.name
                } else {
                    return '';
                }
            };

            spiel.import = function (spiele) {
                spiele = spiele.map(function (single) {
                    return _.mapValues(single, function (value) {
                        if (typeof value === 'string' && value.trim().length === 0) {
                            value = undefined;
                        }
                        return value;
                    });
                });
                return routes.requestPUT(routes.urls.spiele.import(), spiele).then(function (res) {
                    toastr.success(res.GAMES.length + ' Spiele importiert.', 'Import erfolgreich');
                    return res;
                }).catch(function (err) {
                    toastr.error(err.ERROR, 'Fehler bei SpielImport');
                });
            };

            return spiel;
        }]);

})();