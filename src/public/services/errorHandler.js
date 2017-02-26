(function () {
    'use strict';

    angular
        .module('spi.errorHandler', ['toastr'])
        .factory('errorHandler', ['$state', '$q', 'toastr', function ($state, $q, toastr) {
            const errorHandler = {};

            errorHandler.handleResponseError = function (err) {
                toastr.error(err.MESSAGE, 'Fehler');
                return $q.reject(err);
            };

            return errorHandler;
        }]);
})();
