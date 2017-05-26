(function () {
    'use strict';

    angular
        .module('spi.templates.veranstaltungen.ui', [
            'ui.router', 'spi.auth', 'spi.veranstaltungen'
        ])
        .config(states)
        .controller('VeranstaltungenController', VeranstaltungenController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.shared.veranstaltungen', {
                url: '/beachevents',
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

    function VeranstaltungenController(alleVeranstaltungen, auth, veranstaltungen, $state) {
        const vm = this;
        vm.loading = true;


        _.extend(vm, {
            veranstaltungen: alleVeranstaltungen,
            isAdmin: auth.isAdmin(),
            gotoVeranstaltung: gotoVeranstaltung
        });

        function gotoVeranstaltung(event) {
            veranstaltungen.setCurrentEvent(event);
            $state.go('spi.event.home');
        }

        vm.loading = false;
    }
})();