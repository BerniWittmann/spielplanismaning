(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.email-abonnements.ui', [
            'ui.router', 'ngTable'
        ])
        .config(states)
        .controller('EmailAbonnementsContoller', EmailAbonnementsContoller);

    function states($stateProvider) {
        //noinspection JSUnusedGlobalSymbols
        $stateProvider
            .state('spi.verwaltung.email-abonnements', {
                url: '/email-abonnements'
                , templateUrl: 'templates/verwaltung/email-abonnements/email-abonnements.html'
                , controller: EmailAbonnementsContoller
                , controllerAs: 'vm'
                , resolve: {
                    getSubscribersPromise: function (email) {
                        return email.getSubscribers();
                    }
                },
                data: {
                    requiredRoles: ['admin']
                }
            });

    }

    function EmailAbonnementsContoller(email, BestaetigenDialog, NgTableParams, $state, getSubscribersPromise) {
        var vm = this;
        vm.loading = true;

        var emailBlank = {
            subject: ''
            , text: ''
        };

        _.extend(vm, {
            abonnements: (getSubscribersPromise.data || []),
            send: function () {
                if (!_.isEqual(vm.email, emailBlank)) {
                    return BestaetigenDialog.open('Email wirklich an alle Abonnenten senden?', send);
                }
            }
            , gotoTeam: function (team) {
                $state.go('spi.tgj.team', {
                    teamid: team._id
                });
            }
            , gotoJugend: function (jugend) {
                $state.go('spi.tgj.jugend', {
                    jugendid: jugend._id
                });
            }, resetForm: resetForm,
            email: {}
        });

        _.extend(vm.email, emailBlank);

        _.forEach(vm.abonnements, function (o) {
            o.jugendName = o.team.jugend.name;
            o.teamName = o.team.name;
        });

        _.extend(vm, {
            tableParams: new NgTableParams({
                count: 10
            }, {
                counts: []
                , data: vm.abonnements
            })
        });

        function send() {
            email.send(vm.email).then(function () {
                vm.message = 'Emails versendet';
                vm.email = emailBlank;
            }, function (err) {
                vm.err = err;
            });
        }

        function resetForm() {
            vm.message = undefined;
            vm.err = undefined;
        }

        vm.loading = false;
    }
})();