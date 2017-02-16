(function () {
    'use strict';

    angular
        .module('spi.ansprechpartner', ['spi.routes'])
        .factory('ansprechpartner', ['routes', function (routes) {
            var ansprechpartner = {};

            ansprechpartner.getAll = function () {
                return routes.requestGETBase('ansprechpartner');
            };

            ansprechpartner.get = function (id) {
                return routes.requestGETID(routes.urls.ansprechpartner.base(), id);
            };

            ansprechpartner.create = function (data) {
                return routes.requestPOST(routes.urls.ansprechpartner.base(), data);
            };

            ansprechpartner.update = function (id, data) {
                return routes.requestPUTID(routes.urls.ansprechpartner.base(), id, data);
            };

            ansprechpartner.delete = function (id) {
                return routes.requestDELETE(routes.urls.ansprechpartner.base(), id);
            };

            return ansprechpartner;
        }]);

})();