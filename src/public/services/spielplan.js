(function () {
    'use strict';

    angular
        .module('spi.spielplan', ['spi.routes'])
        .factory('spielplan', ['routes', function (routes) {

            const spielplan = {
                startzeit: undefined,
                spielzeit: undefined,
                pausenzeit: undefined,
                endzeit: undefined,
                startdatum: undefined,
                enddatum: undefined,
                spiele: []
            };

            spielplan.getZeiten = function () {
                return routes.requestGETBase('spielplan').then(function (data) {
                    _.defaultsDeep(data, {
                        startzeit: '09:00',
                        spielzeit: 8,
                        pausenzeit: 2,
                        endzeit: '17:00',
                        startdatum: moment().format('DD.MM.YYYY'),
                        enddatum: moment().format('DD.MM.YYYY')
                    });
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