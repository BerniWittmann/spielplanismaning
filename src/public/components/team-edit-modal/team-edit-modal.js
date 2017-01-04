(function () {
    'use strict';

    angular
        .module('spi.components.team-edit-modal.ui', [
            'spi.team', 'ui.bootstrap', 'ui.bootstrap.modal'
        ])
        .service('TeamEditierenDialog', TeamEditierenDialog)
        .controller('TeamEditierenController', TeamEditierenController);

    function TeamEditierenDialog($uibModal) {
        return {
            open: open
        };

        function open(gewaehltesTeam) {
            return $uibModal
                .open({
                    templateUrl: 'components/team-edit-modal/team-edit-modal.html',
                    controller: 'TeamEditierenController',
                    controllerAs: 'vm',
                    resolve: {
                        gewTeam: function () {
                            return gewaehltesTeam;
                        }
                    },
                    size: 'sm'
                });
        }
    }

    function TeamEditierenController($uibModalInstance, team, gewTeam) {
        var vm = this;

        _.extend(vm, {
            team: gewTeam,
            save: save,
            abbrechen: function () {
                $uibModalInstance.dismiss('cancel');
            },
            name: gewTeam.name
        });

        function save() {
            vm.loading = true;
            team.updateName(vm.team, vm.name).then(function (res) {
                vm.loading = false;
                $uibModalInstance.close(res);
            });
        }
    }
})();