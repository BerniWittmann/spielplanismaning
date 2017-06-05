(function () {
    'use strict';

    angular
        .module('spi.gruppe', ['spi.routes'])
        .factory('gruppe', ['routes', function (routes) {

            const gruppe = {};

            gruppe.getAll = function () {
                return routes.requestGETBase('gruppen');
            };

            gruppe.create = function (jugendId, newGruppe) {
                return routes.requestMethodParamsData('POST', routes.urls.gruppen.base(), newGruppe, {jugend: jugendId});
            };

            gruppe.createZwischengruppe = function (jugendId, gruppen) {
                return routes.requestMethodParamsData('POST', routes.urls.gruppen.zwischengruppe(), gruppen, {jugend: jugendId});
            };

            gruppe.get = function (id) {
                return routes.requestGETID(routes.urls.gruppen.base(), id);
            };

            gruppe.getBySlugOrID = function (identifier) {
                return routes.requestGETSlugOrID(routes.urls.gruppen.base(), identifier);
            };

            gruppe.getByJugend = function (jugendid) {
                return routes.requestGETBaseParam('gruppen', {jugend: jugendid});
            };

            gruppe.delete = function (id) {
                return routes.requestDELETE(routes.urls.gruppen.base(), id);
            };

            return gruppe;
        }]);

})();