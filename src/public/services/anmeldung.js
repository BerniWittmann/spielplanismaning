(function () {
    'use strict';

    angular
        .module('spi.anmeldung', ['spi.routes'])
        .factory('anmeldung', ['routes', function (routes) {
            const anmeldung = {};

            anmeldung.get = function (id) {
                return routes.requestGETID(routes.urls.anmeldung.base(), id);
            };

            return anmeldung;
        }]);

})();