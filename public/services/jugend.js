angular
    .module('spi.jugend', ['spi.auth']).factory('jugend', ['$http', 'auth', function ($http) {

    var ENDPOINT_URL = '/api/jugenden';
    var jugend = {
        jugenden: []
    };

    jugend.getAll = function () {
        return $http.get(ENDPOINT_URL).success(function (data) {
            angular.copy(data, jugend.jugenden);
            return data;
        });
    };

    jugend.get = function (id) {
        return $http.get(ENDPOINT_URL + '?id=' + id).then(function (res) {
            return _.head(res.data);
        });
    };

    jugend.create = function (newjugend) {
        return $http.post(ENDPOINT_URL, newjugend).success(function (data) {
            return data;
        });
    };

    jugend.delete = function (id) {
        return $http.delete(ENDPOINT_URL + '?id=' + id).then(function (res) {
            return res;
        })
    };

    jugend.update = function (jugendId, jugend) {
        return $http.put(ENDPOINT_URL + '?id=' + jugendId, jugend).then(function (res) {
            return res.data;
        })
    };

    jugend.addGruppe = function (jugendId, gruppenId) {
        var jugend = jugend.get(jugendId);
        jugend.gruppen.push(gruppenId);
        jugend.update(jugendId, jugend);
    };

    jugend.getTore = function (id) {
        return $http.get(ENDPOINT_URL + '/tore?id=' + id).then(function (res) {
            return res;
        });
    };

    jugend.getGesamtTore = function () {
        return $http.get(ENDPOINT_URL + '/tore').then(function (res) {
            return res;
        });
    };

    return jugend;
}]);