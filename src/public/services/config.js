(function () {
    'use strict';

    angular
        .module('spi.config', ['spi.routes'])
        .factory('config', ['routes', function (routes) {

            function getEnv() {
                return routes.requestGET(routes.urls.config.env());
            }

            function getVersion() {
                return routes.requestGET(routes.urls.config.version());
            }

            function getKontakte() {
                return routes.requestGET(routes.urls.config.kontakt());
            }

            function getLockdown() {
                return routes.requestGET(routes.urls.config.lockdownMode());
            }

            return {
                getEnv: getEnv,
                getVersion: getVersion,
                getKontakte: getKontakte,
                getLockdown: getLockdown
            };
        }]);

})();