(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.ansprechpartner.ui', [
            'ui.router', 'spi.ansprechpartner', 'spi.components.ansprechpartner-single.ui'
        ])
        .config(states)
        .controller('AnsprechpartnerController', AnsprechpartnerController);

    function states($stateProvider) {
        //noinspection JSUnusedGlobalSymbols
        $stateProvider
            .state('spi.verwaltung.ansprechpartner', {
                url: '/ansprechpartner',
                templateUrl: 'templates/verwaltung/ansprechpartner/ansprechpartner.html',
                controller: AnsprechpartnerController,
                controllerAs: 'vm',
                resolve: {
                    kontakte: function (ansprechpartner) {
                        return ansprechpartner.getAll();
                    }
                },
                data: {
                    requiredRoles: ['admin']
                }
            });

    }

    function AnsprechpartnerController(ansprechpartner, kontakte, $scope) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            ansprechpartner: kontakte,
            add: add
        });

        function add() {
            vm.ansprechpartner.push({});
        }

        $scope.$on('ansprechpartnerDeleted', function () {
            ansprechpartner.getAll().then(function (res) {
                vm.ansprechpartner = res;
            });
        });

        vm.loading = false;
    }
})();