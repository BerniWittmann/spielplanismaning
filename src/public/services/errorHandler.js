(function () {
    'use strict';

    angular
        .module('spi.errorHandler', ['toastr', 'toastr', 'ui.router'])
        .factory('errorHandler', ['$state', '$q', 'toastr', '$rootScope', function ($state, $q, toastr, $rootScope) {
            const errorHandler = {};

            errorHandler.handleResponseError = function (err) {
                if (err) {
                    toastr.error(err.MESSAGE, 'Fehler');
                    if ($rootScope.ravenEnabled) {
                        Raven.captureMessage('Error: ' + err.MESSAGEKEY, {
                            level: 'error',
                            extra: err
                        });
                    }
                } else {
                    toastr.warning('Bitte prüfen Sie ihre Internet-Verbindung', 'Keine Internet-Verbindung');
                }

                return $q.reject(err);
            };

            return errorHandler;
        }]);
})();
