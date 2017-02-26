(function () {
    'use strict';

    angular
        .module('spi.components.team-abonnieren-modal.ui', [
            'ui.bootstrap', 'ui.bootstrap.modal', 'spi.email'
        ])
        .service('TeamAbonnierenDialog', TeamAbonnierenDialog)
        .controller('TeamAbonnierenController', TeamAbonnierenController);

    function TeamAbonnierenDialog($uibModal) {
        return {
            open: open
        };

        function open(gewaehltesTeam) {
            return $uibModal
                .open({
                    templateUrl: 'components/team-abonnieren-modal/team-abonnieren-modal.html',
                    controller: 'TeamAbonnierenController',
                    controllerAs: 'vm',
                    resolve: {
                        gewTeam: function () {
                            return gewaehltesTeam;
                        }
                    },
                    size: 'md'
                });
        }
    }

    function TeamAbonnierenController($state, $uibModalInstance, gewTeam, email) {
        const vm = this;
        vm.loading = true;
        const emptymessage = {
            text: '',
            type: ''
        };

        _.extend(vm, {
            team: gewTeam,
            message: emptymessage,
            save: save,
            abbrechen: function () {
                $uibModalInstance.dismiss('cancel');
            },
            abonnent: {
                email: '',
                team: gewTeam._id
            },
            addAbonnent: function (form) {
                vm.submitted = true;
                if (form.$valid && !vm.bereitsabonniert) {
                    email.addSubscriber(vm.abonnent).then(function () {
                        vm.message = {
                            type: 'success',
                            text: vm.team.name + ' wurde abonniert.'
                        };
                        vm.abonnent.email = '';
                        setTimeout(save, 3000);
                    }, function (err) {
                        vm.message = {
                            type: 'error',
                            text: err
                        };
                    });

                }

            },
            resetFormValidation: function () {
                vm.submitted = false;
                vm.bereitsabonniert = false;
                vm.message = emptymessage;
                if (vm.abonnent.email && email.checkSubscription(vm.abonnent)) {
                    vm.message = {
                        type: 'info',
                        text: vm.team.name + ' ist bereits abonniert!'
                    };
                    vm.bereitsabonniert = true;
                }
            },
            gotoAbmelden: function () {
                $uibModalInstance.close();
                $state.go('spi.team-deabonnieren', {teamid: vm.team._id});
            },
            bereitsabonniert: false
        });

        if (email.checkSubscription({
                team: vm.team._id
            })) {
            vm.message = {
                type: 'info',
                text: vm.team.name + ' ist bereits abonniert!'
            };
            vm.abonnent.email =  email.getEmailSubscriptionByTeam(vm.team._id);
            vm.bereitsabonniert = true;
        }
        vm.loading = false;

        function save() {
            $uibModalInstance.close();
        }
    }
})();