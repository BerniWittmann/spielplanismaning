(function () {
    'use strict';

    angular
        .module('spi.storage', ['LocalStorageModule'])
        .factory('storage', ['$window', 'localStorageService', function ($window, localStorageService) {

            const storage = {};

            storage.set = function (key, value) {
                localStorageService.set(key, $window.btoa(value));
            };

            storage.get = function (key) {
                const token = localStorageService.get(key);
                if (token) {
                    try {
                        return $window.atob(token);
                    } catch (err) {
                        console.warn(err);
                        return undefined;
                    }
                }
                return undefined;
            };

            storage.remove = function (key) {
                localStorageService.remove(key);
            };

            return storage;
        }]);
})();