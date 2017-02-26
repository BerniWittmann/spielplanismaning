(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.allgemein.ui', [
            'spi.auth', 'ui.router'
        ])
        .config(states)
        .controller('VerwaltungAllgemeinController', VerwaltungAllgemeinController);

    function states($stateProvider) {
        //noinspection JSUnusedGlobalSymbols
        $stateProvider
            .state('spi.verwaltung.allgemein', {
                url: '/allgemein',
                templateUrl: 'templates/verwaltung/allgemein/verwaltung.allgemein.html',
                controller: VerwaltungAllgemeinController,
                controllerAs: 'vm',
                data: {
                    requiredRoles: ['admin']
                }
            });
    }

    function VerwaltungAllgemeinController(auth) {
        const vm = this;
        vm.loading = true;

        //noinspection JSUnusedGlobalSymbols
        _.extend(vm, {
            user: {},
            register: register,
            resetRegisterForm: resetRegisterForm,
            resetDeleteForm: resetDeleteForm,
            delete: deleteUser
        });

        function resetDeleteForm() {
            vm.delErr = undefined;
            vm.delMsg = undefined;
        }

        function resetRegisterForm() {
            vm.registerErr = undefined;
            vm.registerMsg = undefined;
        }

        function register(form) {
            if (form.$valid) {
                auth.register(vm.user).then(function () {
                    vm.registerMsg = vm.user.username + ' wurde registriert.';
                    vm.user = {};
                }, function (error) {
                    if (error.ERROR.code === 11000) {
                        vm.registerErr = 'Dieser Username oder diese Email existiert bereits';
                    } else {
                        vm.registerErr = error;
                    }
                });
            }
        }

        function deleteUser(form) {
            if (form.$valid) {
                if (auth.currentUser() === vm.username) {
                    vm.delErr = 'Gerade angemeldeter User kann nicht gelöscht werden.';
                    return vm.delErr;
                }
                return auth.deleteUser(vm.username).then(function () {
                    vm.username = undefined;
                    vm.delMsg = 'User gelöscht!';
                }, function (err) {
                    vm.delErr = err;
                });
            }
        }

        vm.loading = false;
    }
})();