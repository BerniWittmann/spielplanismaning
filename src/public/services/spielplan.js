(function () {
    'use strict';

    angular
        .module('spi.spielplan', ['spi.routes'])
        .factory('spielplan', ['routes', function (routes) {

            var spielplan = {
                startzeit: undefined,
                spielzeit: undefined,
                pausenzeit: undefined,
                spiele: []
            };

            spielplan.getZeiten = function () {
                return routes.requestGET(routes.urls.spielplan.base()).then(function (data) {
                    _.defaultsDeep(data, {startzeit: '09:00', spielzeit: 8, pausenzeit: 2});
                    _.extend(spielplan, data);
                    return data;
                });
            };

            spielplan.saveZeiten = function (zeiten) {
                return routes.requestPUT(routes.urls.spielplan.zeiten(), zeiten);
            };

            spielplan.createSpielplan = function () {
                return routes.requestPUT(routes.urls.spielplan.base(), undefined);
            };

            return spielplan;
        }]);
})();