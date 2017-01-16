(function () {
    'use strict';

    angular
        .module('spi.templates.spielplan.ui', [
            'ui.router', 'spi.spiel', 'spi.components.spielplan.singlespiel.ui'
        ])
        .config(states)
        .controller('SpielplanController', SpielplanController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.spielplan', {
                url: '/spielplan',
                templateUrl: 'templates/spielplan/spielplan.html',
                controller: SpielplanController,
                controllerAs: 'vm',
                resolve: {
                    spiele: function (spiel) {
                        return spiel.getAll();
                    }
                }
            });

    }

    function SpielplanController($state, spiele) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            spiele: _.sortBy(spiele, ['nummer']),
            gotoSpiel: function (gewaehltesspiel) {
                if (gewaehltesspiel.jugend) {
                    $state.go('spi.spiel', {
                        spielid: gewaehltesspiel._id
                    });
                }
            }
        });

        vm.loading = false;
    }
})();