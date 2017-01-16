(function () {
    'use strict';

    angular
        .module('spi.gruppe', ['spi.routes'])
        .factory('gruppe', ['routes', function (routes) {

            var gruppe = {};

            gruppe.getAll = function () {
                return routes.request({method: routes.methods.GET, url: routes.urls.gruppen.base()});
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
                return routes.request({method: routes.methods.GET, url: routes.urls.gruppen.base(), params: {id: id}});
            };

            gruppe.getByJugend = function (jugendid) {
                return routes.request({method: routes.methods.GET, url: routes.urls.gruppen.base(), params: {jugend: jugendid}});
            };

            gruppe.delete = function (id) {
                return routes.request({method: routes.methods.DELETE, url: routes.urls.gruppen.base(), params: {id: id}});
            };

            return gruppe;
        }]);

})();