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
                ansprechpartner: {
                    base: function () {
                        return ENDPOINT_BASE + '/ansprechpartner';
                    }
                },
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
                    },
                    bug: function () {
                        return ENDPOINT_BASE + '/email/bug';
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
                    },
                    order: function () {
                        return ENDPOINT_BASE + '/spiele/order';
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

            function requestGET(url) {
                return request({method: methods.GET, url: url});
            }

            function requestGETID(url, id) {
                return request({method: methods.GET, url: url, params: {id: id}});
            }

            function requestDELETE(url, id) {
                return request({method: methods.DELETE, url: url, params: {id: id}});
            }

            function requestPUTID(url, id, data) {
                return request({method: methods.PUT, url: url, params: {id: id}, data:data});
            }

            function requestPUT(url, data) {
                return request({method: methods.PUT, url: url, data:data});
            }

            function requestPOST(url, data) {
                return request({method: methods.POST, url: url, data:data});
            }

            _.extend(routes, {
                methods: methods,
                request: request,
                requestGET: requestGET,
                requestGETID: requestGETID,
                requestDELETE: requestDELETE,
                requestPUT: requestPUT,
                requestPUTID: requestPUTID,
                requestPOST: requestPOST,
                urls: urls
            });


            return routes;
        }]);

}());