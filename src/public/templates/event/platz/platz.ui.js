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
            .state('spi.event.platz', {
                url: '/platz/:platznummer',
                templateUrl: 'templates/event/platz/platz.html',
                controller: PlatzController,
                controllerAs: 'vm',
                resolve: {
                    spiele: function (aktivesEvent, spiel) {
                        return spiel.getAll();
                    },
                    anzahlPlaetze: function (aktivesEvent, config) {
                        return config.getPlaetze();
                    }
                }
            });
    }

    function PlatzController(spiele, $stateParams, errorHandler, anzahlPlaetze, $state) {
        const vm = this;
        vm.loading = true;

        if (!$stateParams.platznummer || $stateParams.platznummer > anzahlPlaetze || $stateParams.platznummer <= 0) {
            $state.go('spi.event.home');
            return errorHandler.handleResponseError({
                MESSAGE: 'Platz nicht gefunden',
                STATUSCODE: 404,
                MESSAGEKEY: 'ERROR_PLATZ_NOT_FOUND'
            });
        }

        _.extend(vm, {
            platz: $stateParams.platznummer,
            spiele: _.sortBy(_.filter(spiele, {platz: parseInt($stateParams.platznummer, 10)}), ['nummer'])
        });
        vm.loading = false;
    }
})();