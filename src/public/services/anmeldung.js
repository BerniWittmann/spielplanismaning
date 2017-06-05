(function () {
    'use strict';

    angular
        .module('spi.anmeldung', ['spi.routes'])
        .factory('anmeldung', ['routes', '$q', function (routes, $q) {
            const anmeldung = {};

            anmeldung.get = function (id) {
                return routes.requestGETID(routes.urls.anmeldung.teams(), id);
            };

            anmeldung.getUrl = function (id) {
                return routes.urls.anmeldung.url() + '/' + id;
            };

            anmeldung.getTurniere = function () {
                return routes.requestGET(routes.urls.anmeldung.turniere());
            };

            anmeldung.getSingleTurniere = function() {
                return anmeldung.getTurniere().then(function (data) {
                   const result = [];
                   data.forEach(function (turnier) {
                       if (turnier.mixed) {
                           result.push(turnier);
                           return;
                       }

                       result.push(filterTurnierGeschlecht(turnier, 'maennl'));
                       result.push(filterTurnierGeschlecht(turnier, 'weibl'));
                   });
                   return $q.when(result);
                });
            };

            function filterTurnierGeschlecht(turnier, geschlecht) {
                const result = _.cloneDeep(turnier);

                if (geschlecht === 'maennl') {
                    result.name = result.name + ' (Männl.)';
                } else {
                    result.name = result.name + ' (Weibl.)';
                }

                result.teams = turnier.teams.filter(function (team) {
                    return team.geschlecht === geschlecht;
                });

                return result;
            }

            return anmeldung;
        }]);

})();