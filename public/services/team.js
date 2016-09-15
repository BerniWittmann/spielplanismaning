angular
    .module('spi.team', []).factory('team', ['$http', function ($http) {

    var ENDPOINT_URL = '/api/teams';
    var team = {
        teams: []
    };

    team.getAll = function () {
        return $http.get(ENDPOINT_URL).success(function (data) {
            angular.copy(data, team.teams);
            return data;
        });
    };

    team.create = function (team) {
        return $http.post(ENDPOINT_URL + '?jugend=' + team.jugend + '&gruppe=' + team.gruppe, team).success(function (data) {
            return data;
        });
    };

    team.get = function (id) {
        return $http.get(ENDPOINT_URL + '?id=' + id).then(function (res) {
            return _.head(res.data);
        });
    };

    team.getByGruppe = function (gruppenid) {
        return $http.get(ENDPOINT_URL + '?gruppe=' + gruppenid).then(function (res) {
            return res.data;
        })
    };

    team.delete = function (teamid) {
        return $http.delete(ENDPOINT_URL + '?id=' + teamid).then(function (res) {
            return res;
        });
    };

    team.resetErgebnisse = function () {
        return $http.put(ENDPOINT_URL + '/resetErgebnisse').then(function (res) {
            return res;
        });
    };

    team.updateName = function (team, name) {
        team.name = name;
        return $http.put(ENDPOINT_URL + '?id=' + team._id, team).then(function (res) {
            return res;
        });
    };

    return team;
}]);