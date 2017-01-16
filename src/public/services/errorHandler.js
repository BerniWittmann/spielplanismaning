(function () {
    'use strict';

    angular
        .module('spi.errorHandler', ['toastr'])
        .factory('errorHandler', ['$state', 'toastr', function ($state, toastr) {
            var errorHandler = {};

            errorHandler.handleResponseError = function (err) {
                $state.go('spi.home');
                toastr.error(err.MESSAGE, 'Fehler');
            };

            return errorHandler;
        }]);
})();
