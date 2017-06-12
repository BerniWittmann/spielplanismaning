(function () {
    'use strict';

    angular
        .module('spi.routes', ['spi.errorHandler', 'spi.constants'])
        .factory('routes', ['$http', 'errorHandler', 'ENDPOINT_BASE', '$q', function ($http, errorHandler, ENDPOINT_BASE, $q) {
            const methods = {
                GET: 'GET',
                POST: 'POST',
                PUT: 'PUT',
                DELETE: 'DELETE'
            };
            const urls = {
                ansprechpartner: {
                    base: function () {
                        return ENDPOINT_BASE + '/ansprechpartner';
                    }
                },
                veranstaltungen: {
                    base: function () {
                        return ENDPOINT_BASE + '/veranstaltungen';
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
                    base: function () {
                        return ENDPOINT_BASE + '/config';
                    },
                    env: function () {
                        return ENDPOINT_BASE + '/config/env';
                    },
                    version: function () {
                        return ENDPOINT_BASE + '/config/version';
                    },
                    kontakt: function () {
                        return ENDPOINT_BASE + '/config/kontakt';
                    },
                    lockdown: function () {
                        return ENDPOINT_BASE + '/config/lockdownmode';
                    },
                    plaetze: function () {
                        return ENDPOINT_BASE + '/config/plaetze';
                    },
                    spielmodus: function () {
                        return ENDPOINT_BASE + '/config/spielmodus';
                    },
                    mannschaftslisten: function () {
                        return ENDPOINT_BASE + '/config/mannschaftslisten';
                    },
                    spielplanEnabled: function () {
                        return ENDPOINT_BASE + '/config/spielplanEnabled';
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
                    },
                    zwischengruppe: function () {
                        return ENDPOINT_BASE + '/gruppen/zwischengruppe';
                    }
                },
                jugenden: {
                    base: function () {
                        return ENDPOINT_BASE + '/turniere';
                    },
                    tore: function () {
                        return ENDPOINT_BASE + '/turniere/tore';
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
                    },
                    import: function () {
                        return ENDPOINT_BASE + '/spiele/import';
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
                    },
                    reloadAnmeldeObjekte: function () {
                        return ENDPOINT_BASE + '/teams/reloadAnmeldeObjekte'
                    }
                },
                anmeldung: {
                    teams: function () {
                        return 'https://beachanmeldung.herokuapp.com/api/teams'
                    },
                    url: function () {
                        return 'https://beachanmeldung.herokuapp.com/verwaltung/team'
                    },
                    turniere: function () {
                        return 'https://beachanmeldung.herokuapp.com/api/turnier'
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

            function requestMethod(method, url) {
                return requestMethodParamsData(method, url, undefined, undefined);
            }

            function requestMethodParams(method, url, params) {
                return requestMethodParamsData(method, url, undefined, params);
            }

            function requestMethodData(method, url, data) {
                return requestMethodParamsData(method, url, data, undefined);
            }

            function requestMethodParamsData(method, url, data, params) {
                if (!methods[method]) {
                    console.error('Unkown method: ' + method);
                    return;
                }
                return request({method: methods[method], url: url, data: data, params: params});
            }

            function requestGET(url) {
                return requestMethod('GET', url);
            }

            function requestGETID(url, id) {
                return requestMethodParams('GET', url, {id: id});
            }

            function requestDELETE(url, id) {
                return requestMethodParams('DELETE', url, {id: id});
            }

            function requestPUTID(url, id, data) {
                return requestMethodParamsData('PUT', url, data, {id: id});
            }

            function requestPUT(url, data) {
                return requestMethodData('PUT', url, data);
            }

            function requestPOST(url, data) {
                return requestMethodData('POST', url, data);
            }

            function requestGETBase(base) {
                return requestGET(urls[base].base());
            }

            function requestGETBaseParam(base, param) {
                return requestMethodParams('GET', urls[base].base(), param);
            }

            function requestGETSlugOrID(url, identifier) {
                return requestMethodParams('GET', url, {identifier: identifier});
            }

            return {
                methods: methods,
                requestMethod: requestMethod,
                requestMethodParams: requestMethodParams,
                requestMethodData: requestMethodData,
                requestMethodParamsData: requestMethodParamsData,
                requestGET: requestGET,
                requestGETID: requestGETID,
                requestDELETE: requestDELETE,
                requestPUT: requestPUT,
                requestPUTID: requestPUTID,
                requestPOST: requestPOST,
                requestGETBaseParam: requestGETBaseParam,
                requestGETBase: requestGETBase,
                requestGETSlugOrID: requestGETSlugOrID,
                urls: urls
            };
        }]);

}());