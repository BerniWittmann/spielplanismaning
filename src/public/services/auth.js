(function () {
    'use strict';

    angular
        .module('spi.auth', ['spi.auth.token', 'spi.routes', 'spi.logger', 'angular-md5'])
        .factory('auth', ['routes', '$state', '$rootScope', 'authToken', '$q', '$window', '$timeout', 'md5', 'Logger', function (routes,
                                                                                                                                 $state,
                                                                                                                                 $rootScope,
                                                                                                                                 authToken,
                                                                                                                                 $q,
                                                                                                                                 $window,
                                                                                                                                 $timeout,
                                                                                                                                 md5,
                                                                                                                                 Logger) {
            const auth = {};
            auth.saveToken = authToken.saveToken;

            auth.getToken = authToken.getToken;

            auth.isLoggedIn = function () {
                const token = auth.getToken();

                if (token) {
                    let payload;
                    try {
                        payload = JSON.parse($window.atob(token.split('.')[1]));
                    } catch (err) {
                        console.warn(err);
                        return false;
                    }
                    if (payload.exp > Date.now() / 1000) {
                        Logger.enableLogging();
                        if ($rootScope.ravenEnabled) {
                            Raven.setUserContext(payload);
                        }
                        return true;
                    }
                    return false;
                }
                Logger.disableLogging();
                return false;
            };

            auth.currentUser = function () {
                if (auth.isLoggedIn()) {
                    const token = auth.getToken();
                    let payload;
                    try {
                        payload = JSON.parse($window.atob(token.split('.')[1]));
                    } catch (err) {
                        console.warn(err);
                        return undefined;
                    }
                    return payload.username;
                }
                return undefined;
            };

            auth.register = function (user) {
                return routes.requestPOST(routes.urls.users.register(), user);
            };

            auth.logIn = function (user) {
                return routes.requestPOST(routes.urls.users.login(), user).then(function (res) {
                    if (res && res.token) {
                        auth.saveToken(res.token);
                        if ($rootScope.ravenEnabled) {
                            Raven.setUserContext(res.token);
                        }
                    }
                    return res;
                }, function (err) {
                    return $q.reject(err);
                });
            };

            auth.deleteUser = function (username) {
                if (auth.isAdmin()) {
                    return routes.requestPUT(routes.urls.users.delete(), {username: username});
                } else {
                    return new Error('No Permission');
                }
            };

            auth.logOut = function () {
                authToken.removeToken();
                if ($rootScope.ravenEnabled) {
                    Raven.setUserContext();
                }
                $state.go('spi.shared.veranstaltungen');
            };

            auth.getRole = function () {
                if (auth.isLoggedIn()) {
                    const token = auth.getToken();

                    if (token && !_.isUndefined(token)) {
                        const payload = JSON.parse($window.atob(token.split('.')[1]));
                        if (payload.exp > Date.now() / 1000) {
                            payload.role.name = payload.role.name.toLowerCase();
                            return payload.role;
                        }
                    }
                }

                return {
                    rank: -1,
                    name: undefined
                };
            };

            auth.canAccess = function (requiredRoles) {
                const role = auth.getRole();

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
                        if (!_.isEqual(toState.name, 'spi.event.login')) {
                            $timeout(function () {
                                $state.go('spi.event.login', {
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
                const data = {
                    email: email
                };

                return routes.requestPUT(routes.urls.users.forgotPassword(), data);
            };

            auth.checkResetToken = function (token) {
                return routes.requestPUT(routes.urls.users.resetPasswordCheck(), {token: token});
            };

            auth.resetPassword = function (username, token, password) {
                const data = {
                    username: username,
                    token: token,
                    password: password
                };
                return routes.requestPUT(routes.urls.users.resetPassword(), data);
            };

            auth.getUserDetails = function () {
                return routes.requestGET(routes.urls.users.userDetails());
            };

            auth.setUserDetails = function (data) {
                return routes.requestPUT(routes.urls.users.userDetails(), data);
            };

            return auth;
        }
        ])
    ;
})();