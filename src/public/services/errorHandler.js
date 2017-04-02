(function () {
    'use strict';

    angular
        .module('spi.errorHandler', ['toastr'])
        .factory('errorHandler', ['$state', '$q', 'toastr', '$rootScope', function ($state, $q, toastr, $rootScope) {
            const errorHandler = {};

            errorHandler.handleResponseError = function (err) {
                toastr.error(err.MESSAGE, 'Fehler');
                if ($rootScope.ravenEnabled) {
                    Raven.captureMessage('Error: ' + err.MESSAGEKEY, {
                        level: 'error',
                        extra: err
                    });
                }
                return $q.reject(err);
            };

            return errorHandler;
        }]);
})();
