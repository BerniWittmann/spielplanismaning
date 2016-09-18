angular
    .module('spi.config', []).factory('config', ['$http', function ($http) {

    var ENDPOINT_URL = '/api/config';

    function getEnv() {
        return $http.get(ENDPOINT_URL + '/env').success(function (res) {
            return res.data;
        });
    }

    function getVersion() {
        return $http.get(ENDPOINT_URL + '/version').success(function (res) {
            return res.data;
        });
    }
    
    function getKontakte() {
        return $http.get(ENDPOINT_URL + '/kontakt').success(function (res) {
            return res.data;
        });
    }

    return {
        getEnv: getEnv,
        getVersion: getVersion,
        getKontakte: getKontakte
    };
}]);