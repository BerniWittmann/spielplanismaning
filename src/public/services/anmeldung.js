(function () {
    'use strict';

    angular
        .module('spi.anmeldung', ['spi.routes'])
        .factory('anmeldung', ['routes', '$q', function (routes, $q) {
            const anmeldung = {};

            function parseTurnier(turnier) {
              return {
                name: turnier.gender === 'mixed' ? turnier.name : turnier.name + (turnier.gender === 'male' ? ' (Männl.)' : ' (Weibl.)'),
                mixed: turnier.gender === 'mixed',
                gender: turnier.gender === 'mixed' ? 'mixed' : (turnier.gender === 'male' ? 'maennl' : 'weibl'),
                teams: turnier.signed_up_teams || []
              }
            }

            anmeldung.get = function (id) {
                return routes.requestGET(routes.urls.anmeldung.teams() + id + '/');
            };

            anmeldung.getUrl = function (id) {
                return routes.urls.anmeldung.url();
            };

            anmeldung.getTurniere = function () {
                return routes.requestGET(routes.urls.anmeldung.turniere()).then(function(data) {
                  const result = [];
                  data.forEach(function (turnier) {
                    result.push(parseTurnier(turnier))
                  });

                  return $q.when(result)
                });
            };

            anmeldung.getSingleTurniere = function() {
                return anmeldung.getTurniere().then(function (data) {
                   return $q.when(data);
                });
            };

            return anmeldung;
        }]);

})();