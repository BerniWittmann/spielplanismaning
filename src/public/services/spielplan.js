(function () {
    'use strict';

    angular
        .module('spi.spielplan', ['spi.routes', 'toastr'])
        .factory('spielplan', ['routes', 'toastr', function (routes, toastr) {

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
                return routes.requestPUT(routes.urls.spielplan.base(), {keep: false}).then(function (res) {
                    toastr.success('Spielplan wurde neu generiert', 'Spielplan generiert');
                });
            };

            spielplan.regenerateSpielplan = function () {
                return routes.requestPUT(routes.urls.spielplan.base(), {keep: true}).then(function (res) {
                    toastr.success('Spielplan wurde aktualisiert', 'Spielplan aktualisiert');
                });
            };

            return spielplan;
        }]);
})();