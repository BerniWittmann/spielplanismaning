(function () {
    'use strict';

    angular
        .module('spi.httpRequestInterceptor', ['spi.auth.token'])
        .factory('httpRequestInterceptor', ['authToken', function (authToken) {
            return {
                request: function (config) {
                    config.headers['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg';

                    return config;
                }
            };
        }])
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('httpRequestInterceptor');
        });

})();