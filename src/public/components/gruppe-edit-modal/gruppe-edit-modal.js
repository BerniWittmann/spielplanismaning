(function () {
    'use strict';

    angular
        .module('spi.components.gruppe-edit-modal.ui', [
            'spi.team', 'ui.bootstrap', 'ui.bootstrap.modal', 'spi.spielplan', 'spi.components.team-edit-modal.ui', 'spi.components.bestaetigen-modal.ui', 'spi.anmeldung'
        ])
        .service('GruppeEditierenDialog', GruppeEditierenDialog)
        .controller('GruppeEditierenController', GruppeEditierenController);

    function GruppeEditierenDialog($uibModal) {
        return {
            open: open
        };

        function open(gewaehlteGruppe) {
            //noinspection JSUnusedGlobalSymbols
            return $uibModal
                .open({
                    templateUrl: 'components/gruppe-edit-modal/gruppe-edit-modal.html',
                    controller: 'GruppeEditierenController',
                    controllerAs: 'vm',
                    resolve: {
                        gewGruppe: function () {
                            return gewaehlteGruppe;
                        },
                        teamPromise: function (team) {
                            return team.getByGruppe(gewaehlteGruppe._id, gewaehlteGruppe.jugend._id);
                        }
                    },
                    size: 'md'
                });
        }
    }

    function GruppeEditierenController($state, $uibModalInstance, team, teamPromise, gewGruppe, spielplan, TeamEditierenDialog, BestaetigenDialog, $scope, anmeldung) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            teams: _.sortBy(teamPromise, 'name'),
            gruppe: gewGruppe,
            team: {},
            save: save,
            abbrechen: abbrechen,
            addTeam: addTeam,
            gotoTeam: gotoTeam,
            deleteTeam: deleteTeam,
            editTeam: editTeam,
            askDeleteTeam: askDeleteTeam,
            objectIdPattern: /^[a-f\d]+$/
        });

        vm.loading = false;

        function save() {
            $uibModalInstance.close();
        }

        function askDeleteTeam(team) {
            return BestaetigenDialog.open('Team ' + team.name + ' wirklich löschen?', vm.deleteTeam, team._id);
        }

        function editTeam(gewTeam) {
            TeamEditierenDialog.open(gewTeam);
        }

        function deleteTeam(teamid) {
            if (!vm.loading) {
                vm.loading = true;
                team.delete(teamid).then(function () {
                    spielplan.createSpielplan();
                    vm.teams = _.remove(vm.teams, function (n) {
                        return !_.isEqual(n._id, teamid);
                    });
                    vm.loading = false;
                });
            }
        }

        function gotoTeam(team) {
            $state.go('spi.event.tgj.team', {
                teamid: team.slug || team.id
            });
            $uibModalInstance.dismiss('cancel');
        }

        function addTeam(form) {
            if (!vm.loading && form.$valid) {
                vm.loading = true;
                _.extend(vm.team, {
                    gruppe: vm.gruppe._id,
                    jugend: vm.gruppe.jugend
                });
                form.$setUntouched();
                return team.create(vm.team).then(function (res) {
                    spielplan.createSpielplan();
                    vm.teams.push(res);
                    vm.team = {};
                    vm.loading = false;
                    return vm.teams;
                });
            }
        }

        function abbrechen() {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.$watch('vm.team.anmeldungsId', function () {
            if (vm.team.anmeldungsId) {
                anmeldung.get(vm.team.anmeldungsId).then(function (res) {
                    if (res.id && res.complete_name) {
                        vm.team.name = res.complete_name;
                    }
                });
            }
        });

    }
})();