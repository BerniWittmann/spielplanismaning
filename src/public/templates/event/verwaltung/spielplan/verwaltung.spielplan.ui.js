(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.spielplan.ui', [
            'ui.router', 'spi.spielplan', 'angular-flatpickr', 'toastr', 'spi.spiel'
        ])
        .config(states)
        .controller('VerwaltungSpielplanController', VerwaltungSpielplanController);

    function states($stateProvider) {
        //noinspection JSUnusedGlobalSymbols
        $stateProvider
            .state('spi.event.verwaltung.spielplan', {
                url: '/spielplan',
                templateUrl: 'templates/event/verwaltung/spielplan/verwaltung.spielplan.html',
                controller: VerwaltungSpielplanController,
                controllerAs: 'vm',
                resolve: {
                    zeiten: function (aktivesEvent, spielplan) {
                        return spielplan.getZeiten();
                    },
                    spiele: function (aktivesEvent, spiel) {
                        return spiel.getAll();
                    }
                },
                data: {
                    requiredRoles: ['admin']
                }
            });
    }

    function VerwaltungSpielplanController(spielplan, zeiten, $scope, toastr, spiele) {
        const vm = this;
        vm.loading = true;
        const d = new Date();
        d.setHours(9);
        d.setMinutes(0);
        const d2 = d;
        d2.setHours(17);

        if (!zeiten.startdatum || !zeiten.enddatum) {
            zeiten.startdatum = moment().format('DD.MM.YYYY');
            zeiten.enddatum = moment().format('DD.MM.YYYY');
        }

        //noinspection JSUnusedGlobalSymbols
        _.extend(vm, {
            startzeit: d,
            endzeit: d2,
            spielzeit: 8,
            pausenzeit: 2,
            saveSpielzeit: saveSpielzeit,
            increment: increment,
            decrement: decrement,
            generateSpielplan: function () {
                spielplan.createSpielplan();
            },
            regenerateSpielplan: function () {
                if (vm.endRundeStarted) {
                    return toastr.warning('Spielplan kann nicht mehr mit Erhalt generiert werden.', 'Endrunde hat bereits begonnen.');
                }
                spielplan.regenerateSpielplan();
            },
            datePickerOptions: {
                mode: 'range',
                dateFormat: 'd.m.Y',
                locale: 'de',
                defaultDate: [moment(zeiten.startdatum, 'DD.MM.YYYY').toDate(), moment(zeiten.enddatum, 'DD.MM.YYYY').toDate()]
            },
            date: moment(d).format('DD.MM.YYYY'),
            startdate: undefined,
            enddate: undefined
        });

        vm.endRundeStarted = spiele.filter(function (single) {
            return single.label !== 'normal' && single.beendet;
        }).length > 0;

        if (!_.isUndefined(zeiten) && !_.isNull(zeiten)) {
            if (moment(zeiten.startzeit, 'HH:mm').isValid()) {
                vm.startzeit = moment(zeiten.startzeit, 'HH:mm').toDate();
            }
            if (moment(zeiten.endzeit, 'HH:mm').isValid()) {
                vm.endzeit = moment(zeiten.endzeit, 'HH:mm').toDate();
            }
            vm.spielzeit = zeiten.spielzeit;
            vm.pausenzeit = zeiten.pausenzeit;
            vm.startdate = zeiten.startdatum;
            vm.enddate = zeiten.enddatum;
            vm.date = zeiten.startdatum + ' bis ' + zeiten.enddatum;
        }

        function saveSpielzeit(form) {
            if (form.$valid) {
                form.$setUntouched();
                vm.loading = true;
                spielplan.saveZeiten({
                    startzeit: moment(vm.startzeit.toISOString()).format('HH:mm'),
                    endzeit: moment(vm.endzeit.toISOString()).format('HH:mm'),
                    spielzeit: vm.spielzeit,
                    pausenzeit: vm.pausenzeit,
                    startdatum: vm.startdate,
                    enddatum: vm.enddate
                }).then(function () {
                    spielplan.getZeiten().then(function (res) {
                        zeiten = res;
                        vm.datePickerOptions.defaultDate = [moment(res.startdatum, 'DD.MM.YYYY').toDate(), moment(res.enddatum, 'DD.MM.YYYY').toDate()];
                        vm.loading = false;
                        toastr.success('Spielplan-Einstellungen wurden gespeichert.', 'Gespeichert');
                    });
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

        $scope.$watch('vm.date', function () {
            if (vm.date) {
                const parts = vm.date.split(' ');
                if (parts.length === 1) {
                    vm.startdate = parts[0];
                    vm.enddate = parts[0];
                } else {
                    vm.startdate = parts[0];
                    vm.enddate = parts[2];
                }
            }
        });

        $scope.$watchGroup(['vm.endzeit','vm.startzeit'], function () {
            if (vm.startzeit && vm.endzeit) {
                if (moment(vm.startzeit.toISOString()).isAfter(moment(vm.endzeit.toISOString()))) {
                    toastr.warning('Die Startzeit muss vor der Endzeit liegen!', 'Achtung!');
                    vm.endzeit = vm.startzeit;
                }
            }
        });

        vm.loading = false;
    }
})();