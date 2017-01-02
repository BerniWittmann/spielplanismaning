(function () {
    'use strict';

    angular
        .module('spi.httpRequestInterceptor', ['spi.auth.token'])
        .factory('httpRequestInterceptor', ['authToken', function (authToken) {
            return {
                request: function (config) {
                    config.headers.Authorization = authToken.getToken();

                    return config;
                }
            };
        }])
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('httpRequestInterceptor');
        });

})();