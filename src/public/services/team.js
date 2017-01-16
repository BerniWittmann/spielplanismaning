(function () {
    'use strict';

    angular
        .module('spi.team', ['spi.routes'])
        .factory('team', ['routes', function (routes) {

            var team = {};

            team.getAll = function () {
                return routes.request({method: routes.methods.GET, url: routes.urls.team.base()});
            };

            team.create = function (team) {
                return routes.request({
                    method: routes.methods.POST,
                    url: routes.urls.team.base(),
                    params: {jugend: team.jugend, gruppe: team.gruppe},
                    data: team
                });
            };

            team.get = function (id) {
                return routes.request({method: routes.methods.GET, url: routes.urls.team.base(), params: {id: id}});
            };

            team.getByGruppe = function (gruppenid) {
                return routes.request({
                    method: routes.methods.GET,
                    url: routes.urls.team.base(),
                    params: {gruppe: gruppenid}
                });
            };

            team.delete = function (teamid) {
                return routes.request({
                    method: routes.methods.DELETE,
                    url: routes.urls.team.base(),
                    params: {id: teamid}
                });
            };

            team.resetErgebnisse = function () {
                return routes.request({method: routes.methods.PUT, url: routes.urls.team.resetErgebnisse()});
            };

            team.updateName = function (team, name) {
                team.name = name;
                return routes.request({
                    method: routes.methods.PUT,
                    url: routes.urls.team.base(),
                    params: {id: team._id},
                    data: team
                });
            };

            return team;
        }]);

})();