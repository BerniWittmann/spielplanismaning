(function () {
    'use strict';

    angular
        .module('spi.auth.token', ['spi.storage'])
        .factory('authToken', ['storage', 'AUTH_TOKEN_NAME', function (storage, AUTH_TOKEN_NAME) {

            var auth = {};

            auth.saveToken = function (token) {
                storage.set(AUTH_TOKEN_NAME, token);
            };

            auth.getToken = function () {
                return storage.get(AUTH_TOKEN_NAME);
            };

            auth.removeToken = function () {
                storage.remove(AUTH_TOKEN_NAME);
            };

            return auth;
        }]);
})();