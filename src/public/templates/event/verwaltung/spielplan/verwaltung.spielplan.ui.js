(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.spielplan.ui', [
            'ui.router', 'spi.spielplan', 'angular-flatpickr', 'toastr', 'spi.spiel', 'spi.config'
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
                    },
                    spielplanEnabled: function (config) {
                        return config.getSpielplanEnabled();
                    }
                },
                data: {
                    requiredRoles: ['admin']
                }
            });
    }

    function VerwaltungSpielplanController(spielplan, zeiten, $scope, toastr, spiele, spiel, spielplanEnabled) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            spielplanEnabled: spielplanEnabled,
            import: _import,
            importButtonDisabled: true,
            fileChange: fileChange
        });

        function _import() {
            if (!vm.importFile) return;

            Papa.parse(vm.importFile, {
                header: true,
                error: function (err) {
                    console.error(err);
                    toastr.error('Ein Fehler bei der Umwandlung ist aufgetreten. Bitte überprüfen Sie Ihre Datei', 'Achtung!');
                },
                complete: function (res) {
                    spiel.import(res.data);
                }
            });
        }

        function fileChange(event, files) {
            if (files && files.length > 0) {
                vm.importFile = files[0];
                vm.importButtonDisabled = false;
            } else {
                vm.importFile = undefined;
                vm.importButtonDisabled = true;
            }
            $scope.$apply();
        }

        if (spielplanEnabled) {
            initZeiten.bind(this)(spielplan, zeiten, $scope, toastr, spiele);
        }

        vm.loading = false;
    }

    function initZeiten(spielplan, zeiten, $scope, toastr, spiele) {
        const vm = this;

        function newDateWithHours(h) {
            const d = new Date();
            d.setHours(h);
            d.setMinutes(0);
            return d;
        }

        const d = newDateWithHours(9);
        const d2 = newDateWithHours(17);

        function prettifyDate(d, format) {
            let date;
            if (d && format) {
                date = moment(d, format);
            } else if (d && !format) {
                date = moment(d);
            } else {
                date = moment()
            }
            return date.format('DD.MM.YYYY');
        }

        if (!zeiten.startdatum || !zeiten.enddatum) {
            zeiten.startdatum = prettifyDate();
            zeiten.enddatum = prettifyDate();
        }

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
            date: prettifyDate(d),
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

        $scope.$watchGroup(['vm.endzeit', 'vm.startzeit'], function () {
            if (vm.startzeit && vm.endzeit) {
                if (moment(vm.startzeit.toISOString()).isAfter(moment(vm.endzeit.toISOString()))) {
                    toastr.warning('Die Startzeit muss vor der Endzeit liegen!', 'Achtung!');
                    vm.endzeit = vm.startzeit;
                }
            }
        });
    }
})();