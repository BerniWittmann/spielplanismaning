(function () {
    'use strict';

    angular
        .module('spi.spiel', ['spi.routes', 'spi.team'])
        .factory('spiel', ['Logger', 'routes', 'team', function (Logger, routes, team) {

            const spiel = {};

            let teams;

            function loadTeams() {
                team.getAll().then(function (res) {
                    teams = res;
                });
            }
            loadTeams();

            spiel.getAll = function () {
                loadTeams();
                return routes.requestGETBase('spiele');
            };

            spiel.create = function (spiel) {
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
                return routes.requestDELETE(routes.urls.spiele.base(), spielid);
            };

            spiel.deleteAll = function () {
                return routes.requestMethod('DELETE', routes.urls.spiele.alle());
            };

            spiel.updateTore = function (spiel) {
                Logger.log('Tore für Spiel #' + spiel.nummer + ' geändert!');
                return routes.requestPUTID(routes.urls.spiele.tore(), spiel._id, spiel);
            };

            spiel.resetSpiel = function (spiel) {
                return routes.requestDELETE(routes.urls.spiele.tore(), spiel._id);
            };

            spiel.updateOrder = function (spiele) {
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

            return spiel;
        }]);

})();