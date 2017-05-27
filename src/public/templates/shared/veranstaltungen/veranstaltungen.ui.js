(function () {
    'use strict';

    angular
        .module('spi.templates.veranstaltungen.ui', [
            'ui.router', 'spi.auth', 'spi.veranstaltungen', 'spi.config'
        ])
        .config(states)
        .controller('VeranstaltungenController', VeranstaltungenController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.shared.veranstaltungen', {
                url: '/home',
                templateUrl: 'templates/shared/veranstaltungen/veranstaltungen.html',
                controller: VeranstaltungenController,
                controllerAs: 'vm',
                resolve: {
                    alleVeranstaltungen: function (veranstaltungen) {
                        return veranstaltungen.getAll();
                    }
                }
            });
    }

    function VeranstaltungenController(alleVeranstaltungen, auth, veranstaltungen, $state, config) {
        const vm = this;
        vm.loading = true;


        _.extend(vm, {
            veranstaltungen: alleVeranstaltungen,
            isAdmin: auth.isAdmin(),
            gotoVeranstaltung: gotoVeranstaltung
        });

        function gotoVeranstaltung(event) {
            veranstaltungen.setCurrentEvent(event);
            config.getConfig();
            $state.go('spi.event.home');
        }

        vm.loading = false;
    }
})();