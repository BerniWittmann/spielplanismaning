(function () {
    'use strict';

    angular
        .module('spi.httpInterceptor', ['spi.auth.token'])
        .factory('httpInterceptor', ['authToken', '$q', '$injector', function (authToken, $q, $injector) {
            return {
                request: function (config) {
                    config.headers.Authorization = authToken.getToken();

                    return config;
                },

                responseError: function (response) {
                    if (response.status == 401 || response.status == 403) {
                        $injector.get('$state').go('spi.login', {reason: 'Sie haben versucht auf eine Ressource zuzugreifen, für die Sie nicht genügend Rechte haben. Bitte melden Sie sich mit einem passenden Account an.'});
                    }
                    return $q.reject(response);
                }
            };
        }])
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('httpInterceptor');
        });
})();