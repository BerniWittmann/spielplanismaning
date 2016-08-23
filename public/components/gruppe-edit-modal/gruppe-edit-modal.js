(function () {
    'use strict';

    angular
        .module('spi.verwaltung.gruppe-edit-modal.ui', [
            'spi.team', 'ui.bootstrap', 'ui.bootstrap.modal', 'spi.spielplan', 'spi.verwaltung.team-edit-modal.ui'
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
                    templateUrl: 'components/gruppe-edit-modal/gruppe-edit-modal.html'
                    , controller: 'GruppeEditierenController'
                    , controllerAs: 'vm'
                    , resolve: {
                        gewGruppe: function () {
                            return gewaehlteGruppe;
                        }
                    }
                    , size: 'md'
                });
        }
    }

    function GruppeEditierenController(
        $state, $uibModalInstance, team, gewGruppe, spielplan, TeamEditierenDialog, BestaetigenDialog
    ) {
        var vm = this;
        vm.loading = true;

        //noinspection JSUnusedGlobalSymbols,JSUnusedGlobalSymbols,JSUnusedGlobalSymbols
        _.extend(vm, {
            gruppe: gewGruppe
            , save: save
            , abbrechen: function () {
                $uibModalInstance.dismiss('cancel');
            }
            , team: {}
            , addTeam: function () {
                if (!vm.loading) {
                    vm.loading = true;
                    _.extend(vm.team, {
                        gruppe: vm.gruppe._id
                        , jugend: vm.gruppe.jugend._id
                    });
                    return team.create(vm.team).then(function (res) {
                        spielplan.createSpielplan();
                        vm.teams.push(res.data);
                        vm.team = {};
                        vm.loading = false;
                        return vm.teams;
                    });
                }
            }
            , gotoTeam: function (teamid) {
                $state.go('spi.tgj.team', {
                    teamid: teamid
                });
                $uibModalInstance.dismiss('cancel');
            }
            , deleteTeam: function (teamid) {
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
            , editTeam: function (gewTeam) {
                TeamEditierenDialog.open(gewTeam);
            }
            , askDeleteTeam: function (team) {
                return BestaetigenDialog.open('Team ' + team.name + ' wirklich löschen?', vm.deleteTeam, team._id);
            }
            , getTeamsByGruppe: getTeamsByGruppe
        });
        getTeamsByGruppe();

        function getTeamsByGruppe() {
            return team.getByGruppe(vm.gruppe._id, vm.gruppe.jugend._id).then(function (res) {
                vm.teams = _.sortBy(res, 'name');
                vm.loading = false;
                return vm.teams;
            });
        }

        function save() {
            $uibModalInstance.close();
        }
    }
})();