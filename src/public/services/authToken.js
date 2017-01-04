(function () {
    'use strict';

    angular
        .module('spi.auth.token', [])
        .factory('authToken', ['$window', 'AUTH_TOKEN_NAME', function ($window, AUTH_TOKEN_NAME) {

            var auth = {};

            auth.saveToken = function (token) {
                $window.localStorage[AUTH_TOKEN_NAME] = token;
            };

            auth.getToken = function () {
                return $window.localStorage[AUTH_TOKEN_NAME];
            };

            auth.removeToken = function () {
                $window.localStorage.removeItem(AUTH_TOKEN_NAME);
            };

            return auth;
        }]);
})();