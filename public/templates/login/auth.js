angular
    .module('spi.auth', []).factory('auth', ['$http', '$state', '$window', 'Logger', function ($http, $state, $window, Logger) {
    var auth = {};

    auth.saveToken = function (token) {
        $window.localStorage['spielplan-ismaning-token'] = token;
    };

    auth.getToken = function () {
        return $window.localStorage['spielplan-ismaning-token'];
    }

    auth.isLoggedIn = function () {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            if (payload.exp > Date.now() / 1000) {
                Logger.enableLogging();
                return true;
            }
        }
        Logger.disableLogging();
        return false;
    };

    auth.currentUser = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.username;
        }
    };

    auth.register = function (user) {
        return $http.post('/register', user).error(function (err) {
            return err;
        }).success(function (data) {
            return data;
        });
    };

    auth.logIn = function (user) {
        return $http.post('/login', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.deleteUser = function (username) {
        if (auth.canAccess(1)) {
            return $http.put('/delete-user', {
                username: username
            }).error(function (err) {
                return err;
            }).success(function (data) {
                return data;
            })
        } else {
            return new Error('No Permission');
        }
    }

    auth.logOut = function () {
        $window.localStorage.removeItem('spielplan-ismaning-token');
        $state.go('spi.home');
    };

    auth.canAccess = function (permission) {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            if (payload.exp > Date.now() / 1000) {
                if (_.isUndefined(permission)) {
                    return true;
                }
                ;
                return permission <= payload.role.rank;
            }
        }
        return false;
    }

    return auth;
}]);