angular
    .module('spi.config', []).factory('config', ['$http', function ($http) {

    var ENDPOINT_URL = '/api/config';

    function getEnv() {
        return $http.get(ENDPOINT_URL + '/env').success(function (res) {
            return res.data;
        });
    }

    return {
        getEnv: getEnv
    };
}]);