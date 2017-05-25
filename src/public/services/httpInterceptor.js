(function () {
    'use strict';

    angular
        .module('spi.httpInterceptor', ['spi.auth.token'])
        .factory('httpInterceptor', ['authToken', '$q', '$injector', function (authToken, $q, $injector) {
            return {
                request: function (config) {
                    const externalRequestRegex = /(http|https)/;
                    if (config.url && externalRequestRegex.test(config.url)) {
                        config.headers.Authorization = undefined;
                    } else {
                        config.headers.Authorization = authToken.getToken();
                    }

                    const currentEvent = $injector.get('veranstaltungen').getCurrentEvent();
                    if (currentEvent && currentEvent._id) {
                        config.headers['Beach-Event-ID'] = currentEvent._id.toString();
                    }

                    return config;
                },

                responseError: function (response) {
                    if (response.status === 401 || response.status === 403) {
                        const state = $injector.get('$state');
                        if (!_.isEqual(state.current.name, 'spi.shared.login')) {
                            state.go('spi.shared.login', {
                                reasonKey: 'AUTH_ERROR',
                                reason: 'Sie haben versucht auf eine Ressource zuzugreifen, für die Sie nicht genügend Rechte haben. Bitte melden Sie sich mit einem passenden Account an.'
                            });
                        }
                    }
                    return $q.reject(response);
                }
            };
        }])
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('httpInterceptor');
        });
})();