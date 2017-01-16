(function () {
    'use strict';

    angular
        .module('spi.spiel', ['spi.routes'])
        .factory('spiel', ['Logger', 'routes', function (Logger, routes) {

            var spiel = {};

            spiel.getAll = function () {
                return routes.request({method: routes.methods.GET, url: routes.urls.spiele.base()});
            };

            spiel.create = function (spiel) {
                return routes.request({method: routes.methods.POST, url: routes.urls.spiele.base(), data: spiel});
            };

            function getByParam(param, id) {
                var params = {};
                params[param] = id;
                return routes.request({method: routes.methods.GET, url: routes.urls.spiele.base(), params: params});
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
                return routes.request({
                    method: routes.methods.DELETE,
                    url: routes.urls.spiele.base(),
                    params: {id: spielid}
                });
            };

            spiel.deleteAll = function () {
                return routes.request({method: routes.methods.DELETE, url: routes.urls.spiele.alle()});
            };

            spiel.updateTore = function (spiel) {
                Logger.log('Tore für Spiel #' + spiel.nummer + ' geändert!');
                return routes.request({
                    method: routes.methods.PUT,
                    url: routes.urls.spiele.tore(),
                    params: {id: spiel._id},
                    data: spiel
                });
            };

            spiel.resetSpiel = function (spiel) {
                return routes.request({method: routes.methods.DELETE, url: routes.urls.spiele.tore(), params: {id: spiel._id}});
            };

            return spiel;
        }]);

})();