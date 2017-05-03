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
                    }
                }
            });

    }

    function SpielplanController($state, $scope, spiele, spiel, auth, toastr, anzahlPlaetze, spielModus) {
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
            deletedSpiele: []
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
            vm.spiele = _.sortBy(vm.spieleBackup, ['nummer']);
            vm.isEditing = false;
            vm.errorIndex = undefined;
        }

        function saveOrder() {
            return spiel.updateOrder(vm.spiele.concat(vm.deletedSpiele)).then(function (res) {
                vm.spiele = _.sortBy(res.GAMES, ['nummer']);
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

        vm.loading = false;
    }
})();