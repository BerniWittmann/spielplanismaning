(function () {
    'use strict';

    angular
        .module('spi', [
            /* module-injector */ 'spi.config', 'spi.auth', 'spi.logger', 'spi.home.ui', 'spi.login.ui', 'spi.tgj.ui', 'spi.navigation.ui', 'spi.team', 'spi.verwaltung.ui', 'ui.router', 'spi.tabellen.ui', 'spi.login.ui', 'spi.spielplan.ui', 'spi.jugenden.jugendlabel.ui', 'spi.spiel.ui', 'spi.tabelle.ui', 'spi.footer.ui', 'spi.loader.ui', 'spi.email', 'spi.team-abonnieren-modal.ui', 'spi.team.deabonnieren.ui', 'spi.platz.ui', 'spi.bestaetigen-modal.ui', 'spi.kontakt.ui'
        ])
        .config(states)
        .controller('AppController', AppController)
        .run(run);

    function states($urlRouterProvider, $stateProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('spi', {
                url: ''
                , template: '<ui-view></ui-view>'
                , abstract: true
                , controller: AppController
            });

        $locationProvider.html5Mode(true);
    }

    function run($rootScope) {
        $rootScope.onload = function () {
            var page = document.getElementById('page');
            page.className = page.className + " loaded";
        };
    }

    function AppController($q, auth, $state, $timeout, config, $rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, toState) {
            checkLockdown($q, auth, $state, $timeout, config, toState, $rootScope);

            $rootScope.loading = true;
        });

        $rootScope.$on('$stateChangeSuccess', function () {
            $rootScope.loading = false;
        });
    }

    function checkLockdown($q, auth, $state, $timeout, config, toState, $rootScope) {
        return config.getLockdown().then(function (res) {
            if (res.data) {
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
                    });
                    $rootScope.loading = false;

                    return $q.reject();
                }
            }
        });
    }
})();