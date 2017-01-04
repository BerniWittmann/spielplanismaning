(function () {
    'use strict';

    angular
        .module('spi.auth', ['spi.auth.token'])
        .factory('auth', ['$http', '$state', 'authToken', '$q', '$window', '$timeout', 'Logger', function ($http,
                                                                                                           $state,
                                                                                                           authToken,
                                                                                                           $q,
                                                                                                           $window,
                                                                                                           $timeout,
                                                                                                           Logger) {
            var auth = {};
            var ENDPOINT_URL = '/api/users';

            auth.saveToken = authToken.saveToken;

            auth.getToken = authToken.getToken;

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
                return $http.post(ENDPOINT_URL + '/register', user).error(function (err) {
                    return err;
                }).success(function (data) {
                    return data;
                });
            };

            auth.logIn = function (user) {
                return $http.post(ENDPOINT_URL + '/login', user).success(function (data) {
                    auth.saveToken(data.token);
                });
            };

            auth.deleteUser = function (username) {
                if (auth.isAdmin()) {
                    return $http.put(ENDPOINT_URL + '/delete', {
                        username: username
                    }).error(function (err) {
                        return err;
                    }).success(function (data) {
                        return data;
                    });
                } else {
                    return new Error('No Permission');
                }
            };

            auth.logOut = function () {
                authToken.removeToken();
                $state.go('spi.home');
            };

            auth.getRole = function () {
                var token = auth.getToken();

                if (token && !_.isUndefined(token)) {
                    var payload = JSON.parse($window.atob(token.split('.')[1]));
                    if (payload.exp > Date.now() / 1000) {
                        payload.role.name = payload.role.name.toLowerCase();
                        return payload.role;
                    }
                }

                return {
                    rank: -1,
                    name: undefined
                };
            };

            auth.canAccess = function (requiredRoles) {
                var role = auth.getRole();

                if (requiredRoles && requiredRoles.length > 0) {
                    return _.includes(requiredRoles, role.name);
                }
                return true;
            };

            auth.isAdmin = function () {
                return auth.canAccess('admin');
            };

            auth.isBearbeiter = function () {
                return auth.canAccess('bearbeiter');
            };

            auth.checkRoute = function ($q, toState) {
                if (toState && toState.data && toState.data.requiredRoles && toState.data.requiredRoles.length > 0) {
                    if (_.includes(toState.data.requiredRoles, auth.getRole().name)) {
                        return $q.when();
                    } else {
                        if (!_.isEqual(toState.name, 'spi.login')) {
                            $timeout(function () {
                                $state.go('spi.login', {reason: 'Sie verfügen nicht über genügend Rechte. Bitte melden Sie sich mit einem passenden Account an.'});
                            });
                        }
                        return $q.reject();
                    }
                }
                return $q.when();
            };

            return auth;
        }]);
})();