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

            team.getBySlugOrID = function (identifier) {
                return routes.requestGETSlugOrID(routes.urls.team.base(), identifier);
            };

            team.getByGruppe = function (gruppenid) {
                return routes.requestGETBaseParam('team', {gruppe: gruppenid});
            };

            team.delete = function (teamid) {
                return routes.requestDELETE(routes.urls.team.base(), teamid);
            };

            team.update = function (team, data) {
                _.assign(team, data);
                return routes.requestPUTID(routes.urls.team.base(), team._id, team);
            };

            team.reloadAnmeldeObjekte = function () {
                return routes.requestPUT(routes.urls.team.reloadAnmeldeObjekte(), undefined);
            }

            return team;
        }]);

})();