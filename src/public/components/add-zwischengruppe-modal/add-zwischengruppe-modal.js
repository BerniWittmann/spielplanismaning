(function () {
    'use strict';

    angular
        .module('spi.components.add-zwischengruppe-modal.ui', [
            'ui.bootstrap', 'ui.bootstrap.modal', 'ui.sortable', 'spi.components.panel.ui', 'spi.gruppe'
        ])
        .service('AddZwischengruppeDialog', AddZwischengruppeDialog)
        .controller('AddZwischengruppeController', AddZwischengruppeController);

    function AddZwischengruppeDialog($uibModal) {
        return {
            open: open
        };

        function open(gewaehlteJugend) {
            return $uibModal
                .open({
                    templateUrl: 'components/add-zwischengruppe-modal/add-zwischengruppe-modal.html',
                    controller: 'AddZwischengruppeController',
                    controllerAs: 'vm',
                    resolve: {
                        gewJugend: function () {
                            return gewaehlteJugend;
                        }
                    },
                    size: 'lg'
                });
        }
    }

    function AddZwischengruppeController($scope, $uibModalInstance, gewJugend, gruppe, $rootScope, $timeout) {
        const vm = this;

        if($rootScope.spielplanEnabled) {
            $timeout(function () {
                $uibModalInstance.dismiss('cancel');
                vm.loading = false;
            }, 0);
            return;
        }

        _.extend(vm, {
            jugend: _.cloneDeep(gewJugend),
            gruppen: _.cloneDeep(gewJugend).gruppen.filter(function (single) {
                return single.type === 'zwischenrunde';
            }),
            teams: [],
            save: save,
            abbrechen: function () {
                $uibModalInstance.dismiss('cancel');
            },
            addGruppe() {
                const name = 'Zwischengruppe ' + String.fromCharCode(97 + vm.gruppen.length).toUpperCase();
                vm.gruppen.push({
                    name: name,
                    teams: []
                });
                vm.hideErr();
            },
            removeGruppe(name) {
                vm.gruppen = vm.gruppen.filter(function (single) {
                    if (single.name !== name) return true;

                    return false;
                });
                vm.hideErr();
            },
            sortableOptions: {
                placeholder: "turnier-import-team",
                connectWith: ".gruppe-container",
                stop: function () {
                    vm.jugend = _.cloneDeep(gewJugend);
                    removeDuplicates();
                }
            },
            err: undefined,
            hideErr: function () {
                vm.err = undefined;
            }
        });

        function countInGruppen(team) {
            let count = 0;
            vm.gruppen.forEach(function (gruppe) {
                count += gruppe.teams.filter(function (t) {
                    return team._id.toString() === t._id.toString();
                }).length;
            });
            return count;
        }

        function removeDuplicates() {
            vm.gruppen = vm.gruppen.map(function (gruppe) {
                gruppe.teams = _.uniqBy(gruppe.teams, '_id');
                gruppe.teams = gruppe.teams.filter(function (team) {
                    const count = countInGruppen(team);
                    return count <= 1;
                });
                return gruppe;
            });
        }

        function checkDuplicatesGruppen() {
            return _.uniqBy(vm.gruppen, 'name').length !== vm.gruppen.length;
        }

        function save() {
            if (checkDuplicatesGruppen()) {
                vm.err = 'Duplikat bei den Gruppen - Namen gefunden.';
                return;
            }
            vm.loading = true;

            const data = _.cloneDeep(vm.gruppen);

            data.forEach(function (gruppe) {
                gruppe.teams = gruppe.teams.map(function (team) {
                    return team._id;
                });
            });

            gruppe.createZwischengruppe(vm.jugend._id, data).then(function (res) {
                vm.loading = false;
                $uibModalInstance.close(res);
            });
        }

        $scope.$watch('vm.jugend', function () {
            vm.jugendGruppen = vm.jugend.gruppen.filter(function (single) {
                return single.type === 'normal';
            });
        });
    }
})();