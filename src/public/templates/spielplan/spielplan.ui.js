(function () {
    'use strict';

    angular
        .module('spi.templates.spielplan.ui', [
            'ui.router', 'ui.sortable', 'spi.spiel', 'spi.auth', 'spi.components.spielplan.singlespiel.ui', 'toastr'
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

    function SpielplanController($state, $scope, spiele, spiel, auth, toastr) {
        var vm = this;
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
            abortEdit: abortEdit
        });

        function checkRowInvalid(index) {
            return vm.errorIndex >= 0 && index >= vm.errorIndex && index < (vm.errorIndex + 3);
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
            return spiel.updateOrder(vm.spiele).then(function (res) {
                vm.spiele = _.sortBy(res.GAMES, ['nummer']);
                vm.isEditing = false;
                vm.errorIndex = undefined;
                toastr.success('Die neue Reihenfolge der Spiele wurde gespeichert.', 'Spielplan gespeichert');
            }, function (err) {
                if (err.MESSAGEKEY === 'ERROR_SPIELPLAN_UNGUELTIG') {
                    vm.errorIndex = err.INDEX_WITH_ERROR;
                }
            });
        }

        $scope.$watch('vm.isEditing', function (newVal) {
            vm.sortableOptions.disabled = !newVal;
        });
        $scope.$watch('vm.spiele', function (newVal) {
            vm.spieleByDate = _.groupBy(_.sortBy(newVal, ['nummer']), 'datum');
        });

        vm.loading = false;
    }
})();