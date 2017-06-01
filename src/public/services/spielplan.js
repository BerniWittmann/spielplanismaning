(function () {
    'use strict';

    angular
        .module('spi.spielplan', ['spi.routes', 'toastr'])
        .factory('spielplan', ['routes', 'toastr', '$rootScope', function (routes, toastr, $rootScope) {
            function isSpielplanEnabled() {
                return $rootScope.spielplanEnabled;
            }

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
                if (!isSpielplanEnabled()) {
                    return;
                }
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
                if (!isSpielplanEnabled()) {
                    return;
                }
                return routes.requestPUT(routes.urls.spielplan.zeiten(), zeiten);
            };

            function generateSpielplan(keep) {
                if (!isSpielplanEnabled()) {
                    return;
                }
                return routes.requestPUT(routes.urls.spielplan.base(), {keep: keep}).then(function (res) {
                    const title = keep ? 'Spielplan aktualisiert' : 'Spielplan generiert';
                    const message = keep ? 'Spielplan wurde aktualisiert' : 'Spielplan wurde neu generiert';
                    toastr.success(message, title);
                    return res;
                });
            }

            spielplan.createSpielplan = function () {
                return generateSpielplan(false);
            };

            spielplan.regenerateSpielplan = function () {
                return generateSpielplan(true);
            };

            return spielplan;
        }]);
})();