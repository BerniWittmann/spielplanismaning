(function () {
    'use strict';

    angular
        .module('spi.gruppe', ['spi.routes'])
        .factory('gruppe', ['routes', function (routes) {

            var gruppe = {};

            gruppe.getAll = function () {
                return routes.requestGET(routes.urls.gruppen.base());
            };

            gruppe.create = function (jugendId, newGruppe) {
                return routes.request({
                    method: routes.methods.POST,
                    url: routes.urls.gruppen.base(),
                    params: {jugend: jugendId},
                    data: newGruppe
                });
            };

            gruppe.get = function (id) {
                return routes.requestGETID(routes.urls.gruppen.base(), id);
            };

            gruppe.getByJugend = function (jugendid) {
                return routes.request({method: routes.methods.GET, url: routes.urls.gruppen.base(), params: {jugend: jugendid}});
            };

            gruppe.delete = function (id) {
                return routes.requestDELETE(routes.urls.gruppen.base(), id);
            };

            return gruppe;
        }]);

})();