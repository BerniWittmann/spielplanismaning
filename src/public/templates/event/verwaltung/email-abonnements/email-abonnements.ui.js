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
            .state('spi.event.verwaltung.email-abonnements', {
                url: '/email-abonnements',
                templateUrl: 'templates/event/verwaltung/email-abonnements/email-abonnements.html',
                controller: EmailAbonnementsContoller,
                controllerAs: 'vm',
                resolve: {
                    subscribers: function (aktivesEvent, email) {
                        return email.getSubscribers();
                    }
                },
                data: {
                    requiredRoles: ['admin']
                }
            });

    }

    function EmailAbonnementsContoller(email, BestaetigenDialog, NgTableParams, $state, subscribers) {
        const vm = this;
        vm.loading = true;

        const emailBlank = {
            subject: '',
            text: ''
        };

        _.extend(vm, {
            abonnements: (subscribers || []),
            send: function (form) {
                if (form.$valid) {
                    form.$setUntouched();
                    if (!_.isEqual(vm.email, emailBlank)) {
                        return BestaetigenDialog.open('Email wirklich an alle Abonnenten senden?', send);
                    }
                }
            },
            gotoTeam: function (team) {
                $state.go('spi.event.tgj.team', {
                    teamid: team.slug || team._id
                });
            },
            gotoJugend: function (jugend) {
                $state.go('spi.event.tgj.jugend', {
                    jugendid: jugend.slug || jugend._id
                });
            },
            resetForm: resetForm,
            email: {}
        });

        _.extend(vm.email, emailBlank);

        _.forEach(vm.abonnements, function (o) {
            o.jugendName = o.team ? o.team.jugend.name : '';
            o.teamName = o.team ? o.team.name : '';
        });

        _.extend(vm, {
            tableParams: new NgTableParams({
                count: 10
            }, {
                counts: [],
                data: vm.abonnements
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