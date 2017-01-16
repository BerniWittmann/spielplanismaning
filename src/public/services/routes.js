(function () {
    'use strict';

    angular
        .module('spi.routes', ['spi.errorHandler', 'spi.constants'])
        .factory('routes', ['$http', 'errorHandler', 'ENDPOINT_BASE', function ($http, errorHandler, ENDPOINT_BASE) {
            var routes = {};
            var methods = {
                GET: 'GET',
                POST: 'POST',
                PUT: 'PUT',
                DELETE: 'DELETE'
            };
            var urls = {
                users: {
                    register: function () {
                        return ENDPOINT_BASE + '/users/register';
                    },
                    login: function () {
                        return ENDPOINT_BASE + '/users/login';
                    },
                    delete: function () {
                        return ENDPOINT_BASE + '/users/delete';
                    },
                    forgotPassword: function () {
                        return ENDPOINT_BASE + '/users/password-forgot';
                    },
                    resetPassword: function () {
                        return ENDPOINT_BASE + '/users/password-reset';
                    },
                    resetPasswordCheck: function () {
                        return ENDPOINT_BASE + '/users/password-reset/check';
                    },
                    userDetails: function () {
                        return ENDPOINT_BASE + '/users/user-details';
                    }
                },
                config: {
                    env: function () {
                        return ENDPOINT_BASE + '/config/env';
                    },
                    version: function () {
                        return ENDPOINT_BASE + '/config/version';
                    },
                    kontakt: function () {
                        return ENDPOINT_BASE + '/config/kontakt';
                    },
                    lockdownMode: function () {
                        return ENDPOINT_BASE + '/config/lockdownmode';
                    }
                },
                email: {
                    base: function () {
                        return ENDPOINT_BASE + '/email';
                    },
                    subscriber: function () {
                        return ENDPOINT_BASE + '/email/subscriber';
                    }
                },
                gruppen: {
                    base: function () {
                        return ENDPOINT_BASE + '/gruppen';
                    }
                },
                jugenden: {
                    base: function () {
                        return ENDPOINT_BASE + '/jugenden';
                    },
                    tore: function () {
                        return ENDPOINT_BASE + '/jugenden/tore';
                    }
                },
                spiele: {
                    base: function () {
                        return ENDPOINT_BASE + '/spiele';
                    },
                    alle: function () {
                        return ENDPOINT_BASE + '/spiele/alle';
                    },
                    tore: function () {
                        return ENDPOINT_BASE + '/spiele/tore';
                    }
                },
                spielplan: {
                    base: function () {
                        return ENDPOINT_BASE + '/spielplan';
                    },
                    zeiten: function () {
                        return ENDPOINT_BASE + '/spielplan/zeiten';
                    }
                },
                team: {
                    base: function () {
                        return ENDPOINT_BASE + '/teams';
                    },
                    resetErgebnisse: function () {
                        return ENDPOINT_BASE + '/teams/resetErgebnisse';
                    }
                }
            };

            function request(payload) {
                return $http(payload).then(function successCallback(response) {
                    return response.data;
                }, function errorCallback(response) {
                    return errorHandler.handleResponseError(response.data);
                });
            }

            _.extend(routes, {
                methods: methods,
                request: request,
                urls: urls
            });


            return routes;
        }]);

}());