(function () {
    'use strict';

    angular
        .module('spi.spiel', ['spi.routes'])
        .factory('spiel', ['Logger', 'routes', function (Logger, routes) {

            var spiel = {};

            spiel.getAll = function () {
                return routes.requestGETBase('spiele');
            };

            spiel.create = function (spiel) {
                return routes.requestPOST(routes.urls.spiele.base(), spiel);
            };

            function getByParam(param, id) {
                var params = {};
                params[param] = id;
                return routes.requestGETBaseParam('spiele', params);
            }

            spiel.get = function (id) {
                return getByParam('id', id);
            };

            spiel.getByGruppe = function (gruppenid) {
                return getByParam('gruppe', gruppenid);
            };

            spiel.getByJugend = function (jugendid) {
                return getByParam('jugend', jugendid);
            };

            spiel.getByTeam = function (teamid) {
                return getByParam('team', teamid);
            };

            spiel.delete = function (spielid) {
                return routes.requestDELETE(routes.urls.spiele.base(), spielid);
            };

            spiel.deleteAll = function () {
                return routes.requestMethod('DELETE', routes.urls.spiele.alle());
            };

            spiel.updateTore = function (spiel) {
                Logger.log('Tore für Spiel #' + spiel.nummer + ' geändert!');
                return routes.requestPUTID(routes.urls.spiele.tore(), spiel._id, spiel);
            };

            spiel.resetSpiel = function (spiel) {
                return routes.requestDELETE(routes.urls.spiele.tore(), spiel._id);
            };

            spiel.updateOrder = function (spiele) {
                return routes.requestPUT(routes.urls.spiele.order(), spiele);
            };

            return spiel;
        }]);

})();