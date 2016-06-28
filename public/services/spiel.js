angular
    .module('spi.spiel', ['spi.auth']).factory('spiel', ['$http', 'auth', 'Logger', function ($http, auth, Logger) {

    var spiel = {
        spiele: []
    };

    spiel.getAll = function () {
        return $http.get('/spiele').success(function (data) {
            angular.copy(data, spiel.spiele);
            return data;
        });
    };

    spiel.create = function (spiel) {
        return $http.post('/spiele', spiel).success(function (data) {
            Logger.log(data);
            return data;
        }).error(function (data) {
            Logger.log('Error');
            Logger.log(data);
            return null;
        });
    };

    spiel.get = function (id) {
        return $http.get('/spiele/' + id).then(function (res) {
            return res.data;
        });
    };

    spiel.getByGruppe = function (gruppenid, jugendid) {
        return $http.get('/jugenden/' + jugendid + '/gruppen/' + gruppenid + '/spiele').then(function (res) {
            return res.data;
        })
    };

    spiel.getByJugend = function (jugendid) {
        return $http.get('/jugenden/' + jugendid + '/spiele').then(function (res) {
            return res.data;
        })
    };

    spiel.getByTeam = function (teamid) {
        return $http.get('/teams/' + teamid + '/spiele').then(function (res) {
            return res.data;
        })
    };

    spiel.delete = function (spielid) {
        return $http.delete('/spiele/' + spielid).then(function (res) {
            return res;
        });
    };

    spiel.deleteAll = function () {
        return $http.delete('/spiele').then(function (res) {
            return res;
        });
    };

    spiel.updateTore = function (spiel) {
        Logger.log('Tore für Spiel #' + spiel.nummer + ' geändert!');
        return $http.put('/spiele/' + spiel._id + '/tore', spiel).then(function (res) {
            Logger.log(res);
            return res;
        });
    };

    spiel.resetSpiel = function (spiel) {
        return $http.delete('/spiele/' + spiel._id + '/tore').then(function (res) {
            return res;
        });
    };

    return spiel;
}]);