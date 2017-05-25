(function () {
    'use strict';

    angular
        .module('spi.jugend', ['spi.routes'])
        .factory('jugend', ['routes', function (routes) {

            const jugend = {};

            jugend.getAll = function () {
                return routes.requestGETBase('jugenden');
            };

            jugend.get = function (id) {
                return routes.requestGETID(routes.urls.jugenden.base(), id);
            };

            jugend.getBySlugOrID = function (identifier) {
                return routes.requestGETSlugOrID(routes.urls.jugenden.base(), identifier);
            };

            jugend.create = function (newjugend) {
                return routes.requestPOST(routes.urls.jugenden.base(), newjugend);
            };

            jugend.delete = function (id) {
                return routes.requestDELETE(routes.urls.jugenden.base(), id);
            };

            jugend.update = function (jugendId, jugend) {
                return routes.requestMethodParamsData('PUT', routes.urls.jugenden.base(), jugend, {id: jugendId});
            };

            jugend.addGruppe = function (jugendId, gruppenId) {
                let jgd;
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