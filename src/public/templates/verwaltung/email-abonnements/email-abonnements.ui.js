(function () {
    'use strict';

    angular
        .module('spi.verwaltung.email-abonnements.ui', [
            'ui.router', 'ngTable'
        ])
        .config(states)
        .controller('EmailAbonnementsContoller', EmailAbonnementsContoller);

    function states($stateProvider) {
        $stateProvider
            .state('spi.verwaltung.email-abonnements', {
                url: '/email-abonnements'
                , templateUrl: 'templates/verwaltung/email-abonnements/email-abonnements.html'
                , controller: EmailAbonnementsContoller
                , controllerAs: 'vm'
                , resolve: {
                    authenticate: authenticate
                }
            });

    }

    function authenticate($q, auth, $state, $timeout) {
        if (auth.canAccess(1)) {
            return $q.when();
        } else {
            $timeout(function () {
                $state.go('spi.login');
            });

            return $q.reject();
        }
    }

    function EmailAbonnementsContoller(email, BestaetigenDialog, NgTableParams, $state) {
        var vm = this;
        vm.loading = true;

        email.getSubscribers().then(function (res) {
            vm.abonnements = res.data;
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
            vm.loading = false;
        }, function (res) {
            console.log(res);
            vm.abonnements = [];
            _.extend(vm, {
                tableParams: new NgTableParams({
                    count: 10
                }, {
                    counts: []
                    , data: vm.abonnements
                })
            });
            vm.loading = false;
        });

        _.extend(vm, {
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
            }
        });

        var emailBlank = {
            subject: ''
            , text: ''
        };
        vm.email = {};
        _.extend(vm.email, emailBlank);

        function send() {
            email.send(vm.email).then(function () {
                vm.message = 'Emails versendet';
                vm.email = emailBlank;
            }, function (err) {
                vm.err = err;
            });
        }

        vm.resetForm = function () {
            vm.message = undefined;
            vm.err = undefined;
        };

    }
})();