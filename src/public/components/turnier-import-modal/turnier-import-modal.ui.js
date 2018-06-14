(function () {
    'use strict';

    angular
        .module('spi.components.turnier-import-modal.ui', [
            'ui.bootstrap', 'ui.bootstrap.modal', 'ui.sortable', 'spi.components.panel.ui', 'spi.jugend'
        ])
        .service('TurnierImportDialog', TurnierImportDialog)
        .controller('TurnierImportController', TurnierImportController);

    function TurnierImportDialog($uibModal) {
        return {
            open: open
        };

        function open(gewaehlteJugend, impJugend) {
            return $uibModal
                .open({
                    templateUrl: 'components/turnier-import-modal/turnier-import-modal.html',
                    controller: 'TurnierImportController',
                    controllerAs: 'vm',
                    resolve: {
                        gewJugend: function () {
                            return gewaehlteJugend;
                        },
                        importedJugend: function () {
                            return impJugend;
                        }
                    },
                    size: 'lg'
                });
        }
    }

    function TurnierImportController($scope, $uibModalInstance, importedJugend, gewJugend, jugend) {
        const vm = this;

        _.extend(vm, {
            jugend: gewJugend,
            gruppen: [{
                name: 'Gruppe A',
                teams: []
            }],
            unusedTeams: importedJugend && importedJugend.teams ? importedJugend.teams.map(function (team) {
                if (!team) return;
                return {
                    name: team.complete_name,
                    anmeldungsId: team.id
                }
            }) : [],
            save: save,
            abbrechen: function () {
                $uibModalInstance.dismiss('cancel');
            },
            addGruppe() {
                const name = 'Gruppe ' + String.fromCharCode(97 + vm.gruppen.length).toUpperCase();
                vm.gruppen.push({
                    name: name,
                    teams: []
                });
                vm.hideErr();
            },
            newTeam: {
                name: '',
                anmeldungsId: ''
            },
            addTeamPopoverOpen: false,
            addTeam() {
                vm.unusedTeams.push(vm.newTeam);
                vm.addTeamPopoverOpen = false;
            },
            removeGruppe(name) {
                vm.gruppen = vm.gruppen.filter(function (single) {
                    if(single.name !== name) return true;

                    vm.unusedTeams = vm.unusedTeams.concat(single.teams);
                    return false;
                });
                vm.hideErr();
            },
            sortableOptions: {
                placeholder: "turnier-import-team",
                connectWith: ".gruppe-container"
            },
            saveWarningVisible: false,
            err: undefined,
            hideErr: function () {
                vm.err = undefined;
            }
        });

        function checkDuplicatesGruppen() {
            return _.uniqBy(vm.gruppen, 'name').length !== vm.gruppen.length;
        }

        function save() {
            if (!vm.saveWarningVisible && vm.unusedTeams.length > 0) {
                vm.saveWarningVisible = true;
                return;
            }
            if (checkDuplicatesGruppen()) {
                vm.err = 'Duplikat bei den Gruppen - Namen gefunden.';
                return;
            }
            vm.loading = true;

            const data = _.cloneDeep(vm.jugend);
            data.gruppen = vm.gruppen;

            jugend.create(data).then(function(res) {
                vm.loading = false;
                $uibModalInstance.close(res);
            });
        }

        $scope.$watchCollection('vm.unusedTeams', function () {
           if (vm.unusedTeams.length === 0) {
               vm.saveWarningVisible = false;
           }
        });

        $scope.$watch('vm.addTeamPopoverOpen', function () {
            if (!vm.addTeamPopoverOpen) {
                vm.newTeam = {
                    name: '',
                    anmeldungsId: ''
                };
            }
        });
    }
})();