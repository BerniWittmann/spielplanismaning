(function () {
    'use strict';

    angular
        .module('spi.config', ['spi.routes'])
        .factory('config', ['routes', function (routes) {

            function getEnv() {
                return routes.request({method: routes.methods.GET, url: routes.urls.config.env()});
            }

            function getVersion() {
                return routes.request({method: routes.methods.GET, url: routes.urls.config.version()});
            }

            function getKontakte() {
                return routes.request({method: routes.methods.GET, url: routes.urls.config.kontakt()});
            }

            function getLockdown() {
                return routes.request({method: routes.methods.GET, url: routes.urls.config.lockdownMode()});
            }

            return {
                getEnv: getEnv,
                getVersion: getVersion,
                getKontakte: getKontakte,
                getLockdown: getLockdown
            };
        }]);

})();