(function () {
    'use strict';

    angular
        .module('spi.jugend', ['spi.routes'])
        .factory('jugend', ['routes', function (routes) {

            var jugend = {};

            jugend.getAll = function () {
                return routes.requestGET(routes.urls.jugenden.base());
            };

            jugend.get = function (id) {
                return routes.requestGETID(routes.urls.jugenden.base(), id);
            };

            jugend.create = function (newjugend) {
                return routes.requestPOST(routes.urls.jugenden.base(), newjugend);
            };

            jugend.delete = function (id) {
                return routes.requestDELETE(routes.urls.jugenden.base(), id);
            };

            jugend.update = function (jugendId, jugend) {
                return routes.request({
                    method: routes.methods.PUT,
                    url: routes.urls.jugenden.base(),
                    params: {id: jugendId},
                    data: jugend
                });
            };

            jugend.addGruppe = function (jugendId, gruppenId) {
                var jgd;
                return jugend.get(jugendId).then(function (res) {
                    jgd = res;
                    jgd.gruppen.push(gruppenId);
                    return jugend.update(jugendId, jgd);
                });
            };

            jugend.getTore = function (id) {
                return routes.requestGETID(routes.urls.jugenden.tore(), id);
            };

            jugend.getGesamtTore = function () {
                return routes.requestGET(routes.urls.jugenden.tore());
            };

            return jugend;
        }]);

})();