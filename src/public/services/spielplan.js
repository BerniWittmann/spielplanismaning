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
                return routes.request({method: routes.methods.GET, url: routes.urls.spielplan.base()}).then(function (data) {
                    _.defaultsDeep(data, {startzeit: '09:00', spielzeit: 8, pausenzeit: 2});
                    _.extend(spielplan, data);
                    return spielplan;
                });
            };

            spielplan.saveZeiten = function (zeiten) {
                return routes.request({method: routes.methods.PUT, url: routes.urls.spielplan.zeiten(), data: zeiten});
            };

            spielplan.createSpielplan = function () {
                return routes.request({method: routes.methods.PUT, url: routes.urls.spielplan.base()});
            };

            return spielplan;
        }]);
})();