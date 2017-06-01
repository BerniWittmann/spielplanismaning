(function () {
    'use strict';

    angular
        .module('spi.config', ['spi.routes'])
        .factory('config', ['routes', '$q', '$rootScope', function (routes, $q, $rootScope) {

            const config = {
                env: undefined,
                version: undefined,
                lockdown: undefined,
                plaetze: undefined,
                spielmodus: undefined,
                mannschaftslisten: undefined,
                spielplanEnabled: undefined
            };

            function parseToInt(str) {
                if (typeof str === 'string' || str instanceof String) {
                    if (str.match(/^([0-9]+)$/)) {
                        return parseInt(str, 10);
                    }
                    return str;
                }
                return str;
            }

            function getConfigParam(name) {
                if (name !== 'lockdown' && config[name]) return $q.when(config[name]);

                return routes.requestGET(routes.urls.config[name]()).then(function (data) {
                    config[name] = parseToInt(data);
                    if (name === 'spielmodus') {
                        $rootScope.isComplexMode = config.spielmodus === 'complex';
                    }
                    if (name === 'spielplanEnabled') {
                        $rootScope.spielplanEnabled = !!config.spielplanEnabled;
                    }
                    return config[name];
                });
            }

            function getConfig() {
                return routes.requestGET(routes.urls.config.base()).then(function (data) {
                    config.env = data.env || config.env;
                    config.version = data.version || config.version;
                    config.lockdown = _.isUndefined(data.lockdown) ? config.lockdown : data.lockdown;
                    config.plaetze = parseInt(data.plaetze, 10) || config.plaetze;
                    config.spielmodus = data.spielmodus || config.spielmodus;
                    config.mannschaftslisten = data.mannschaftslisten || config.mannschaftslisten;
                    $rootScope.isComplexMode = config.spielmodus === 'complex';
                    config.spielplanEnabled = !_.isUndefined(data.spielplanEnabled) ? data.spielplanEnabled : !!config.spielplanEnabled;
                    $rootScope.spielplanEnabled = config.spielplanEnabled;
                    return config;
                });
            }

            function getEnv() {
                return getConfigParam('env');
            }

            function getVersion() {
                return getConfigParam('version');
            }

            function getLockdown() {
                return getConfigParam('lockdown');
            }

            function getPlaetze() {
                return getConfigParam('plaetze');
            }

            function getSpielmodus() {
                return getConfigParam('spielmodus')
            }

            function getMannschaftslisten() {
                return getConfigParam('mannschaftslisten')
            }

            function getSpielplanEnabled() {
                return getConfigParam('spielplanEnabled');
            }
            return {
                getConfig: getConfig,
                getEnv: getEnv,
                getVersion: getVersion,
                getLockdown: getLockdown,
                getPlaetze: getPlaetze,
                getSpielmodus: getSpielmodus,
                getMannschaftslisten: getMannschaftslisten,
                getSpielplanEnabled: getSpielplanEnabled
            };
        }]);

})();