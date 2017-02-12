(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.spielplan.ui', [
            'ui.router', 'spi.spielplan'
        ])
        .config(states)
        .controller('VerwaltungSpielplanController', VerwaltungSpielplanController);

    function states($stateProvider) {
        //noinspection JSUnusedGlobalSymbols
        $stateProvider
            .state('spi.verwaltung.spielplan', {
                url: '/spielplan',
                templateUrl: 'templates/verwaltung/spielplan/verwaltung.spielplan.html',
                controller: VerwaltungSpielplanController,
                controllerAs: 'vm',
                resolve: {
                    zeiten: function (spielplan) {
                        return spielplan.getZeiten();
                    }
                },
                data: {
                    requiredRoles: ['admin']
                }
            });
    }

    function VerwaltungSpielplanController(spielplan, zeiten) {
        var vm = this;
        vm.loading = true;
        var d = new Date();
        d.setHours(9);
        d.setMinutes(0);

        //noinspection JSUnusedGlobalSymbols
        _.extend(vm, {
            startzeit: d,
            spielzeit: 8,
            pausenzeit: 2,
            saveSpielzeit: saveSpielzeit,
            increment: increment,
            decrement: decrement,
            generateSpielplan: function () {
                spielplan.createSpielplan();
            }
        });

        if (!_.isUndefined(zeiten) && !_.isNull(zeiten)) {
            var date = new Date();
            date.setHours(parseInt(zeiten.startzeit.substring(0, 2), 10));
            date.setMinutes(parseInt(zeiten.startzeit.substring(3, 5), 10));
            vm.startzeit = date;
            vm.spielzeit = zeiten.spielzeit;
            vm.pausenzeit = zeiten.pausenzeit;
        }

        function saveSpielzeit(form) {
            if (form.$valid) {
                vm.loading = true;
                spielplan.saveZeiten({
                    startzeit: moment(vm.startzeit.toISOString()).format('HH:mm')
                    , spielzeit: vm.spielzeit
                    , pausenzeit: vm.pausenzeit
                }).then(function () {
                    vm.loading = false;
                });
            }
        }

        function increment(name) {
            if (_.isEqual(name, 'spielzeit')) {
                vm.spielzeit = vm.spielzeit + 1;
            } else if (_.isEqual(name, 'pausenzeit')) {
                vm.pausenzeit = vm.pausenzeit + 1;
            }
        }

        function decrement(name) {
            if (_.isEqual(name, 'spielzeit')) {
                if (vm.spielzeit > 1) {
                    vm.spielzeit = vm.spielzeit - 1;
                }
            } else if (_.isEqual(name, 'pausenzeit')) {
                if (vm.pausenzeit > 1) {
                    vm.pausenzeit = vm.pausenzeit - 1;
                }
            }
        }

        vm.loading = false;
    }
})();