(function () {
    'use strict';

    angular
        .module('spi.auth.token', []).factory('authToken', ['$window', function ($window) {
        var TOKEN_NAME = 'spielplan-ismaning-token';

        var auth = {};

        auth.saveToken = function (token) {
            $window.localStorage[TOKEN_NAME] = token;
        };

        auth.getToken = function () {
            return $window.localStorage[TOKEN_NAME];
        };

        auth.removeToken = function () {
            $window.localStorage.removeItem(TOKEN_NAME);
        };

        return auth;
    }]);

})();