(function () {
    'use strict';

    angular
        .module('spi.templates.spielplan.ui', [
            'ui.router', 'spi.logger', 'ui.sortable', 'spi.spiel', 'spi.auth', 'spi.components.spielplan.singlespiel.ui', 'toastr'
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
                    },
                    anzahlPlaetze: function (config) {
                        return config.getPlaetze();
                    },
                    spielModus: function (config) {
                        return config.getSpielmodus();
                    },
                    zeiten: function (spielplan) {
                        return spielplan.getZeiten();
                    }
                }
            });

    }

    function SpielplanController($state, $scope, spiele, spiel, auth, toastr, anzahlPlaetze, spielModus, zeiten) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            spiele: _.sortBy(spiele, ['nummer']),
            spieleByDate: _.groupBy(_.sortBy(spiele, ['nummer']), 'datum'),
            gotoSpiel: function (gewaehltesspiel) {
                if (gewaehltesspiel.jugend) {
                    $state.go('spi.spiel', {
                        spielid: gewaehltesspiel._id
                    });
                }
            },
            spieleBackup: spiele,
            sortableOptions: {
                axis: 'y',
                disabled: true,
                update: function (e, ui) {
                    vm.errorIndex = undefined;
                    if (ui.item.scope().spiel.beendet) {
                        ui.item.sortable.cancel();
                        toastr.warning('Spiele die bereits beendet sind können nicht mehr verschoben werden.', 'Spiel nicht verschiebbar');
                    }
                },
                stop: function (e, ui) {
                    recalculateDateTimePlatz();
                    vm.delays = [];
                }
            },
            isEditing: false,
            canEdit: auth.isAdmin(),
            toggleEdit: toggleEdit,
            saveOrder: saveOrder,
            errorIndex: undefined,
            checkRowInvalid: checkRowInvalid,
            abortEdit: abortEdit,
            isLastPlatz: isLastPlatz,
            isComplexMode: spielModus === 'complex',
            addEmptySpiel: function () {
                vm.spiele.push({
                    nummer: vm.spiele.length + 1,
                    isNew: true,
                    _id: 'testId' + moment().toISOString()
                });
            },
            deletedSpiele: [],
            delays: {}
        });

        function checkRowInvalid(index) {
            return vm.errorIndex >= 0 && index >= vm.errorIndex && index < (vm.errorIndex + 3);
        }

        function isLastPlatz(spiel) {
            return spiel.platz === anzahlPlaetze;
        }

        function toggleEdit() {
            if (vm.canEdit) {
                vm.isEditing = !vm.isEditing;
            } else {
                vm.isEditing = false;
            }
        }

        function abortEdit() {
            vm.delays = {};
            vm.isEditing = false;
            vm.errorIndex = undefined;
            vm.spiele = _.sortBy(vm.spieleBackup, ['nummer']);
            return spiel.getAll().then(function (res) {
                vm.spiele = _.sortBy(res, ['nummer']);
            });
        }

        function saveOrder() {
            return spiel.updateOrder({spiele: vm.spiele.concat(vm.deletedSpiele), delays: vm.delays}).then(function (res) {
                vm.spiele = _.sortBy(res.GAMES, ['nummer']);
                vm.spieleBackup = vm.spiele;
                vm.isEditing = false;
                vm.errorIndex = undefined;
                vm.deletedSpiele = [];
                toastr.success('Die neue Reihenfolge der Spiele wurde gespeichert.', 'Spielplan gespeichert');
            }, function (err) {
                if (err.MESSAGEKEY === 'ERROR_SPIELPLAN_UNGUELTIG') {
                    vm.errorIndex = err.INDEX_WITH_ERROR;
                }
            });
        }


        vm.showJugend = checkShowJugend();
        vm.showGruppe = checkShowGruppe();

        function checkShowJugend() {
            const jugenden = _.groupBy(vm.spiele, 'jugend._id');
            return Object.keys(jugenden).length > 1;
        }

        function checkShowGruppe() {
            let result = false;
            const spiele = _.cloneDeep(vm.spiele);
            const jugenden = _.uniqBy(_.map(spiele, function (spiel) {
                return spiel.jugend;
            }), '_id');
            _.forEach(jugenden, function (jugend) {
                if (jugend && jugend.gruppen.length > 1) {
                    result = true;
                }
            });
            return result;
        }

        $scope.$watch('vm.isEditing', function (newVal) {
            vm.sortableOptions.disabled = !newVal;
        });
        $scope.$watch('vm.spiele', function (newVal) {
            vm.spieleByDate = _.groupBy(_.sortBy(newVal, ['nummer']), 'datum');
        });

        $scope.$on('updatedTore', function () {
           spiel.getAll().then(function (spiele) {
               vm.spiele = _.sortBy(spiele, ['nummer']);
           });
        });

        $scope.$on('removeSpiel', function (event, spielid) {
            const currentSpiel = vm.spiele.find(function (single) {
                return single._id.toString() === spielid;
            });
            currentSpiel.deleted = true;
            vm.deletedSpiele.push(currentSpiel);
            vm.spiele = vm.spiele.filter(function (single) {
                return single._id.toString() !== spielid;
            });
        });

        $scope.$on('delayChanged', function (event, data) {
           const index = vm.spiele.findIndex(function (single) {
               return single._id.toString() === data.spiel._id.toString();
           });
           const valBefore = vm.delays[index];
           if (index >= 0 && (data.delay || (data.delay === 0 && valBefore && valBefore !== 0)) && !_.isNaN(data.delay)) {
               vm.delays[index] = data.delay;
               recalculateDateTimePlatz()
           }
        });

        function recalculateDateTimePlatz() {
            vm.spiele = vm.spiele.map(function (spiel, index) {
                const dateTimeObj = calcZeit(index);
                spiel.datum = dateTimeObj.date;
                spiel.uhrzeit = dateTimeObj.time;
                spiel.platz = dateTimeObj.platz;
                return spiel;
            });
        }

        function calcZeit(index) {
            const plaetze = anzahlPlaetze;
            const dailyStartTime = moment(zeiten.startzeit, 'HH:mm');
            const dailyEndTime = moment(zeiten.endzeit, 'HH:mm');
            const spielePerDay = Math.floor(dailyEndTime.diff(dailyStartTime, 'minutes') / (zeiten.spielzeit + zeiten.pausenzeit)) * plaetze;
            if (spielePerDay < 0) {
                return undefined;
            }
            const offsetDays = Math.floor((index) / spielePerDay);
            if (offsetDays < 0) {
                return undefined;
            }
            const offsetSpiele = (index) % spielePerDay;
            if (offsetSpiele < 0) {
                return undefined;
            }

            let delayBefore = 0;

            _.forIn(vm.delays, function (value, key) {
                const i = parseInt(key, 10);

                if (i < index) {
                    delayBefore += value;
                }
            });

            const date = moment(zeiten.startdatum, 'DD.MM.YYYY').set({'hour': dailyStartTime.get('hour'), 'minute': dailyStartTime.get('minute')}).add(offsetDays, 'days').add(delayBefore, 'minutes');
            const time = dailyStartTime.add(Math.floor(offsetSpiele / plaetze) * (zeiten.spielzeit + zeiten.pausenzeit) + delayBefore, 'minutes');
            const platz = (offsetSpiele % plaetze) + 1;

            return {
                date: date.format('DD.MM.YYYY'),
                time: time.format('HH:mm'),
                platz: platz
            }
        }

        vm.loading = false;
    }
})();