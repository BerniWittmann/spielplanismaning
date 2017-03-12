(function () {
    'use strict';

    angular
        .module('spi.config', ['spi.routes'])
        .factory('config', ['routes', '$q', function (routes, $q) {

            const config = {
                env: undefined,
                version: undefined,
                lockdown: undefined
            };

            function getConfig() {
                return routes.requestGET(routes.urls.config.base()).then(function (data) {
                    config.env = data.env || config.env;
                    config.version = data.version || config.version;
                    config.lockdown = _.isUndefined(data.lockdown) ? config.lockdown : data.lockdown;
                    return config;
                });
            }

            function getEnv() {
                if (config.env) return $q.when(config.env);

                return routes.requestGET(routes.urls.config.env()).then(function (data) {
                    config.env = data;
                    return config.env;
                });
            }

            function getVersion() {
                if (config.version) return $q.when(config.version);

                return routes.requestGET(routes.urls.config.version()).then(function (data) {
                    config.version = data;
                    return config.version;
                });
            }

            function getLockdown() {
                return routes.requestGET(routes.urls.config.lockdownMode()).then(function (data) {
                    config.lockdown = data;
                    return config.lockdown;
                });
            }

            return {
                getConfig: getConfig,
                getEnv: getEnv,
                getVersion: getVersion,
                getLockdown: getLockdown
            };
        }]);

})();