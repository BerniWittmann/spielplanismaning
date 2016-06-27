angular
    .module('spi.jugend', ['spi.auth']).factory('jugend', ['$http', 'auth', function ($http, auth) {

    var jugend = {
        jugenden: []
    };

    jugend.getAll = function () {
        return $http.get('/jugenden').success(function (data) {
            angular.copy(data, jugend.jugenden);
            return data;
        });
    };

    jugend.create = function (newjugend) {
        return $http.post('/jugenden', newjugend).success(function (data) {
            return data;
        });
    };

    jugend.get = function (id) {
        return $http.get('/jugenden/' + id).then(function (res) {
            return res.data;
        });
    };

    jugend.delete = function (id) {
        return $http.delete('/jugenden/' + id).then(function (res) {
            return res;
        })
    }

    jugend.update = function (jugendId, jugend) {
        return $http.put('/jugenden/' + jugendId).then(function (res) {
            return res.data;
        })
    }

    jugend.addGruppe = function (jugendId, gruppenId) {
        var jugend = jugend.get(jugendId);
        jugend.gruppen.push(gruppenId);
        jugend.update(jugendId, jugend);
    }

    jugend.getTore = function (id) {
        return $http.get('/jugenden/' + id + '/tore').then(function (res) {
            return res;
        });
    }

    return jugend;
}]);