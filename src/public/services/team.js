(function () {
    'use strict';

    angular
        .module('spi.team', ['spi.routes'])
        .factory('team', ['routes', function (routes) {

            const team = {};

            team.getAll = function () {
                return routes.requestGETBase('team');
            };

            team.create = function (team) {
                return routes.requestMethodParamsData('POST', routes.urls.team.base(), team, {jugend: team.jugend, gruppe: team.gruppe});
            };

            team.get = function (id) {
                return routes.requestGETID(routes.urls.team.base(), id);
            };

            team.getByGruppe = function (gruppenid) {
                return routes.requestGETBaseParam('team', {gruppe: gruppenid});
            };

            team.delete = function (teamid) {
                return routes.requestDELETE(routes.urls.team.base(), teamid);
            };

            team.resetErgebnisse = function () {
                return routes.requestPUT(routes.urls.team.resetErgebnisse(), undefined);
            };

            team.updateName = function (team, name) {
                team.name = name;
                return routes.requestPUTID(routes.urls.team.base(), team._id, team);
            };

            return team;
        }]);

})();