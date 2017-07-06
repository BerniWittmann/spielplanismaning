(function () {
    'use strict';

    angular
        .module('spi.veranstaltungen', ['spi.routes', 'spi.config', 'spi.templates.verwaltung.veranstaltungen.ui'])
        .factory('veranstaltungen', ['routes', 'storage', 'CURRENT_EVENT_TOKEN_NAME', '$rootScope', 'config', '$state', function (routes, storage, CURRENT_EVENT_TOKEN_NAME, $rootScope, config, $state) {
            const veranstaltungen = {};

            veranstaltungen.getAll = function () {
                return routes.requestGETBase('veranstaltungen');
            };

            function cacheAlleEvents() {
                veranstaltungen.getAll().then(function (res) {
                    veranstaltungen.alleVeranstaltungen = res;
                });
            }

            veranstaltungen.get = function (id) {
                return routes.requestGETID(routes.urls.veranstaltungen.base(), id);
            };

            veranstaltungen.getBySlugOrID = function (identifier) {
                return routes.requestGETSlugOrID(routes.urls.veranstaltungen.base(), identifier);
            };

            veranstaltungen.create = function (data) {
                return routes.requestPOST(routes.urls.veranstaltungen.base(), data).then(function (res) {
                    cacheAlleEvents();
                    return res;
                });
            };

            veranstaltungen.update = function (id, data) {
                return routes.requestPUTID(routes.urls.veranstaltungen.base(), id, data);
            };

            veranstaltungen.delete = function (id) {
                return routes.requestDELETE(routes.urls.veranstaltungen.base(), id).then(function (res) {
                    cacheAlleEvents();
                    return res;
                });
            };

            veranstaltungen.updateSlugs = function (data) {
                return routes.requestPUT(routes.urls.veranstaltungen.slugs(), data);
            };

            veranstaltungen.setCurrentEvent = function (event) {
                if ($rootScope.ravenEnabled) {
                    Raven.setExtraContext({currentEvent: event});
                }
                if (!event) {
                    storage.remove(CURRENT_EVENT_TOKEN_NAME);
                    config.getConfig();
                    return;
                }
                storage.set(CURRENT_EVENT_TOKEN_NAME, JSON.stringify(event));
                config.getConfig();
            };

            veranstaltungen.getCurrentEvent = function () {
                const eventStr = storage.get(CURRENT_EVENT_TOKEN_NAME);
                if (!eventStr) return undefined;

                let event;
                try {
                    event = JSON.parse(eventStr);
                } catch(e) {
                    return undefined;
                }

                if (!event || !event._id) return undefined;

                if (!veranstaltungen.alleVeranstaltungen) return event;

                const veranstaltung = veranstaltungen.alleVeranstaltungen.find(function (single) {
                    return single._id === event._id;
                });

                if (!veranstaltung || veranstaltung._id !== event._id) {
                    storage.remove(CURRENT_EVENT_TOKEN_NAME);
                    if ($rootScope.ravenEnabled) {
                        Raven.setExtraContext({currentEvent: undefined});
                    }
                    return undefined;
                }
                if ($rootScope.ravenEnabled) {
                    Raven.setExtraContext({currentEvent: event});
                }

                return event;
            };

            return veranstaltungen;
        }]);

})();