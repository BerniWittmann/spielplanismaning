(function () {
    'use strict';

    angular
        .module('spi.tgj.gruppen.ui', [
            'spi.auth', 'spi.gruppe', 'spi.tgj.gruppe.ui', 'ui.router', 'spi.gruppen.gruppenpanel.ui'
        ])
        .config(states)
        .controller('GruppenController', GruppenController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.tgj.gruppen', {
                url: '/gruppen'
                , templateUrl: 'templates/tgj/gruppen/gruppen.html'
                , controller: GruppenController
                , controllerAs: 'vm'
            });

    }

    function GruppenController($state, gruppe) {
        var vm = this;
        vm.loading = true;

        //noinspection JSUnusedGlobalSymbols
        _.extend(vm, {
            gruppen: [],
            //TODO wird das überhaupt genutzt?
            gotoGruppe: function (gruppe) {
                $state.go('spi.tgj.gruppe', {gruppeid: gruppe._id});
            }
        });

        gruppe.getAll().then(function (response) {
            vm.gruppen = response.data;
            //TODO vm.teams???? nicht vm.gruppen?
            _.forEach(vm.teams, function (o) {
                o.jugendName = o.jugend.name;
            });
            vm.loading = false;
        });
    }
})();