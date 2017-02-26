(function () {
    'use strict';

    angular
        .module('spi.templates.password-forgot.ui', [
            'spi.auth', 'ui.router'
        ])
        .config(states)
        .controller('PasswordForgotController', PasswordForgotController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.password-forgot', {
                url: '/forgot-password',
                templateUrl: 'templates/password-forgot/password-forgot.html',
                controller: PasswordForgotController,
                controllerAs: 'vm',
                data: {
                    requiredRoles: []
                }
            });

    }

    function PasswordForgotController(auth, toastr) {
        const vm = this;
        vm.email = undefined;

        vm.forgotPassword = function (form) {
            if(form.$valid && vm.email) {
                auth.forgotPassword(vm.email).then(function () {
                    toastr.success('Wir haben eine Email mit weiteren Infos an ' + vm.email + ' versendet.', 'Email versendet');
                }, function (error) {
                    console.log(error);
                    toastr.error(error.MESSAGE, 'Fehler');
                });
            }
        };
    }
})();