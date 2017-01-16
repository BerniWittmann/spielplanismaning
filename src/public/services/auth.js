(function () {
    'use strict';

    angular
        .module('spi.auth', ['spi.auth.token', 'spi.routes'])
        .factory('auth', ['routes', '$state', 'authToken', '$q', '$window', '$timeout', 'Logger', function (routes,
                                                                                                            $state,
                                                                                                            authToken,
                                                                                                            $q,
                                                                                                            $window,
                                                                                                            $timeout,
                                                                                                            Logger) {
            var auth = {};
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
                return routes.request({method: routes.methods.POST, url: routes.urls.users.register(), data: user});
            };

            auth.logIn = function (user) {
                return routes.request({
                    method: routes.methods.POST,
                    url: routes.urls.users.login(),
                    data: user
                }).then(function (res) {
                    auth.saveToken(res.token);
                    return res;
                });
            };

            auth.deleteUser = function (username) {
                if (auth.isAdmin()) {
                    return routes.request({
                        method: routes.methods.PUT,
                        url: routes.urls.users.delete(),
                        data: {username: username}
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
                                $state.go('spi.login', {
                                    next: toState.name,
                                    reasonKey: 'AUTH_ERROR',
                                    reason: 'Sie verfügen nicht über genügend Rechte. Bitte melden Sie sich mit einem passenden Account an.'
                                });
                            });
                        }
                        return $q.reject();
                    }
                }
                return $q.when();
            };

            auth.forgotPassword = function (email) {
                var data = {
                    email: email
                };

                return routes.request({
                    method: routes.methods.PUT,
                    url: routes.urls.users.forgotPassword(),
                    data: data
                });
            };

            auth.checkResetToken = function (token) {
                return routes.request({
                    method: routes.methods.PUT,
                    url: routes.urls.users.resetPasswordCheck(),
                    data: {token: token}
                });
            };

            auth.resetPassword = function (username, token, password) {
                var data = {
                    username: username,
                    token: token,
                    password: password
                };
                return routes.request({method: routes.methods.PUT, url: routes.urls.users.resetPassword(), data: data});
            };

            auth.getUserDetails = function () {
                return routes.request({method: routes.methods.GET, url: routes.urls.users.userDetails()});
            };

            auth.setUserDetails = function (data) {
                return routes.request({method: routes.methods.PUT, url: routes.urls.users.userDetails(), data: data});
            };

            return auth;
        }]);
})();