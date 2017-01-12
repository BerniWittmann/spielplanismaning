(function () {
    'use strict';

    angular
        .module('spi.templates.account.ui', [
            'ui.router', 'spi.auth'
        ])
        .config(states)
        .controller('AccountController', AccountController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.account', {
                url: '/account',
                templateUrl: 'templates/account/account.html',
                controller: AccountController,
                controllerAs: 'vm',
                resolve: {
                    userDetails: function (auth) {
                        return auth.getUserDetails();
                    }
                },
                data: {
                    requiredRoles: []
                }
            });

    }

    function AccountController(userDetails, auth, toastr) {
        var vm = this;
        var email = userDetails.data.email;

        _.extend(vm, {
            user: userDetails.data,
            resetPassword: function () {
                auth.forgotPassword(email).then(function () {
                    toastr.success('Wir haben eine Email mit weiteren Infos an ' + email + ' versendet.', 'Email versendet')
                }, function (error) {
                    console.log(error);
                    toastr.error(error.data.MESSAGE, 'Fehler');
                });
            },
            changeUserDetails: function () {
                auth.setUserDetails(vm.user).then(function (response) {
                    auth.saveToken(response.data.token);
                    toastr.success('Wir haben deine Daten gespeichert', 'Gespeichert')
                }, function (error) {
                    console.log(error);
                    toastr.error(error.data.MESSAGE, 'Fehler');
                });
            }
        })
    }
})();