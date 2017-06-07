(function () {
    'use strict';

    angular
        .module('spi.storage', ['LocalStorageModule'])
        .factory('storage', ['$window', 'localStorageService', '$injector', function ($window, localStorageService, $injector) {

            const storage = {};

            storage.set = function (key, value) {
                if (!localStorageService.isSupported) {
                    $injector.get('toastr').error('Bitte aktivieren Sie Cookies!', 'Achtung!');
                }
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