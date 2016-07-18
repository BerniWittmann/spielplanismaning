angular
    .module('spi.spiel', ['spi.auth']).factory('spiel', ['$http', 'auth', 'Logger', function ($http, auth, Logger) {

    var ENDPOINT_URL = '/api/spiele';
    var spiel = {
        spiele: []
    };

    spiel.getAll = function () {
        return $http.get(ENDPOINT_URL).success(function (data) {
            angular.copy(data, spiel.spiele);
            return data;
        });
    };

    spiel.create = function (spiel) {
        return $http.post(ENDPOINT_URL, spiel).success(function (data) {
            Logger.log(data);
            return data;
        }).error(function (data) {
            Logger.log('Error');
            Logger.log(data);
            return null;
        });
    };

    spiel.get = function (id) {
        return $http.get(ENDPOINT_URL + '?id=' + id).then(function (res) {
            return res.data;
        });
    };

    spiel.getByGruppe = function (gruppenid) {
        return $http.get(ENDPOINT_URL + '?gruppe=' + gruppenid).then(function (res) {
            return res.data;
        })
    };

    spiel.getByJugend = function (jugendid) {
        return $http.get(ENDPOINT_URL + '?jugend=' + jugendid).then(function (res) {
            return res.data;
        })
    };

    spiel.getByTeam = function (teamid) {
        return $http.get(ENDPOINT_URL + '?team=' + teamid).then(function (res) {
            return res.data;
        })
    };

    spiel.delete = function (spielid) {
        return $http.delete(ENDPOINT_URL + '?id=' + spielid).then(function (res) {
            return res;
        });
    };

    spiel.deleteAll = function () {
        return $http.delete(ENDPOINT_URL + '/alle').then(function (res) {
            return res;
        });
    };

    spiel.updateTore = function (spiel) {
        Logger.log('Tore für Spiel #' + spiel.nummer + ' geändert!');
        return $http.put(ENDPOINT_URL + '/tore?id=' + spiel._id, spiel).then(function (res) {
            Logger.log(res);
            return res;
        });
    };

    spiel.resetSpiel = function (spiel) {
        return $http.delete(ENDPOINT_URL + '/tore?id=' + spiel._id).then(function (res) {
            return res;
        });
    };

    return spiel;
}]);