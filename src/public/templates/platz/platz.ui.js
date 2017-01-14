(function () {
    'use strict';

    angular
        .module('spi.templates.platz.ui', [
            'ui.router', 'spi.spiel'
        ])
        .config(states)
        .controller('PlatzController', PlatzController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.platz', {
                url: '/platz/:platznummer',
                templateUrl: 'templates/platz/platz.html',
                controller: PlatzController,
                controllerAs: 'vm',
                resolve: {
                    spielPromise: function (spiel) {
                        return spiel.getAll();
                    }
                }
            });
    }

    function PlatzController(spielPromise, $stateParams, errorHandler, ANZAHL_PLAETZE) {
        var vm = this;
        vm.loading = true;

        if (!$stateParams.platznummer || $stateParams.platznummer > ANZAHL_PLAETZE || $stateParams.platznummer <= 0) {
            return errorHandler.handleResponseError({
                MESSAGE: 'Platz nicht gefunden',
                STATUSCODE: 404,
                MESSAGEKEY: 'ERROR_PLATZ_NOT_FOUND'
            });
        }

        _.extend(vm, {
            platz: $stateParams.platznummer,
            spiele: _.sortBy(_.filter(spielPromise.data, {platz: parseInt($stateParams.platznummer, 10)}), ['nummer'])
        });
        vm.loading = false;
    }
})();