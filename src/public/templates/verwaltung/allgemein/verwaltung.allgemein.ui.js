(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.allgemein.ui', [
            'spi.auth', 'ui.router', 'spi.spielplan'
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
                resolve: {
                    getZeitenPromise: function (spielplan) {
                        return spielplan.getZeiten();
                    }
                },
                data: {
                    requiredRoles: ['admin']
                }
            });
    }

    function VerwaltungAllgemeinController(auth, spielplan, getZeitenPromise) {
        var vm = this;
        vm.loading = true;
        var d = new Date();
        d.setHours(9);
        d.setMinutes(0);

        //noinspection JSUnusedGlobalSymbols
        _.extend(vm, {
            user: {},
            register: register,
            startzeit: d,
            spielzeit: 8,
            pausenzeit: 2,
            resetRegisterForm: resetRegisterForm,
            resetDeleteForm: resetDeleteForm,
            delete: deleteUser,
            saveSpielzeit: saveSpielzeit,
            increment: increment,
            decrement: decrement
        });

        if (!_.isUndefined(getZeitenPromise.data) && !_.isNull(getZeitenPromise.data)) {
            var date = new Date();
            date.setHours(parseInt(getZeitenPromise.data.startzeit.substring(0, 2), 10));
            date.setMinutes(parseInt(getZeitenPromise.data.startzeit.substring(3, 5), 10));
            vm.startzeit = date;
            vm.spielzeit = getZeitenPromise.data.spielzeit;
            vm.pausenzeit = getZeitenPromise.data.pausenzeit;
        }

        function resetDeleteForm() {
            vm.delErr = undefined;
            vm.delMsg = undefined;
        }

        function resetRegisterForm() {
            vm.registerErr = undefined;
            vm.registerMsg = undefined;
        }

        function register() {
            auth.register(vm.user).then(function () {
                vm.registerMsg = vm.user.username + ' wurde registriert.';
                vm.user = {};
            }, function (error) {
                if (error.data.ERROR.code === 11000) {
                    vm.registerErr = 'Dieser Username oder diese Email existiert bereits';
                } else {
                    vm.registerErr = error;
                }
            });
        }

        function deleteUser() {
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

        function saveSpielzeit() {
            vm.loading = true;
            spielplan.saveZeiten({
                startzeit: moment(vm.startzeit.toISOString()).format('HH:mm')
                , spielzeit: vm.spielzeit
                , pausenzeit: vm.pausenzeit
            }).then(function () {
                vm.loading = false;
            });
        }

        function increment(name) {
            if (_.isEqual(name, 'spielzeit')) {
                vm.spielzeit = vm.spielzeit + 1;
            } else if (_.isEqual(name, 'pausenzeit')) {
                vm.pausenzeit = vm.pausenzeit + 1;
            }
        }

        function decrement(name) {
            if (_.isEqual(name, 'spielzeit')) {
                if (vm.spielzeit > 1) {
                    vm.spielzeit = vm.spielzeit - 1;
                }
            } else if (_.isEqual(name, 'pausenzeit')) {
                if (vm.pausenzeit > 1) {
                    vm.pausenzeit = vm.pausenzeit - 1;
                }
            }
        }

        vm.loading = false;
    }
})();