(function () {
    'use strict';

    angular
        .module('spi.gruppe', [])
        .factory('gruppe', ['$http', 'errorHandler', function ($http, errorHandler) {

            var ENDPOINT_URL = '/api/gruppen';

            var gruppe = {};

            gruppe.getAll = function () {
                return $http.get(ENDPOINT_URL).success(function (data) {
                    return data;
                });
            };

            gruppe.create = function (jugendId, newgruppe) {
                return $http.post(ENDPOINT_URL + '?jugend=' + jugendId, newgruppe).success(function (data) {
                    return data;
                });
            };

            gruppe.get = function (id) {
                return $http.get(ENDPOINT_URL + '?id=' + id).error(function (err) {
                    return errorHandler.handleResponseError(err);
                }).then(function (res) {
                    return res.data;
                });
            };

            gruppe.getByJugend = function (jugendid) {
                return $http.get(ENDPOINT_URL + '?jugend=' + jugendid).then(function (res) {
                    return res.data;
                });
            };

            gruppe.delete = function (id) {
                return $http.delete(ENDPOINT_URL + '?id=' + id).then(function (res) {
                    return res;
                });
            };

            return gruppe;
        }]);

})();