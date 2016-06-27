(function () {
    'use strict';

    angular
        .module('spi', [
            'spi.auth', 'spi.logger', 'spi.home.ui', 'spi.login.ui', 'spi.tgj.ui', 'spi.navigation.ui', 'spi.team', 'spi.verwaltung.ui', 'ui.router', 'spi.tabellen.ui', 'spi.login.ui', 'spi.spielplan.ui', 'spi.jugenden.jugendlabel.ui', 'spi.spiel.ui', 'spi.tabelle.ui', 'spi.footer.ui', 'spi.loader.ui', 'spi.email', 'spi.team-abonnieren-modal.ui', 'spi.team.deabonnieren.ui', 'spi.platz.ui', 'spi.bestaetigen-modal.ui'
        ])
        .config(states)
        .controller('AppController', AppController)
        .run(run);

    function states($urlRouterProvider, $stateProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('spi', {
                url: ''
                , template: '<ui-view></ui-view>'
                , abstract: true
                , resolve: {
                    lockdownmode: getLockdown
                }
                , controller: AppController
            });
    }

    function run($state, $rootScope) {
        $rootScope.$on('$stateChangeStart', function () {
            $rootScope.loading = true;
        });

        $rootScope.$on('$stateChangeSuccess', function () {
            $rootScope.loading = false;
        });
    }

    function AppController($q, auth, $state, $timeout, lockdownmode, $rootScope) {
        checkLockdown($q, auth, $state, $timeout, lockdownmode, undefined, $rootScope);
        $rootScope.$on('$stateChangeStart', function (event, toState) {
            checkLockdown($q, auth, $state, $timeout, lockdownmode, toState, $rootScope);
        });
    }

    function checkLockdown($q, auth, $state, $timeout, lockdownmode, toState, $rootScope) {
        if (lockdownmode) {
            if (_.isUndefined(toState)) {
                toState = {
                    name: 'InitialState'
                };
            }
            if (_.isEqual(toState.name, 'spi.login') || _.isEqual(toState.name, 'spi.team-deabonnieren') || auth.isLoggedIn()) {
                return $q.when();
            } else {
                $timeout(function () {
                    $state.go('spi.login');
                })
                $rootScope.loading = false;

                return $q.reject();
            }
        }
    }

    function getLockdown($http) {
        return $http.get('/config/lockdownmode').then(function (res) {
            return res.data == true;
        });
    }
})();