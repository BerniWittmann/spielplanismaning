(function () {
    'use strict';

    angular
        .module('spi', [
            /* module-injector */ 'spi.config', 'spi.auth', 'spi.logger', 'ui.router', 'spi.components.navigation.ui', 'spi.templates.ui', 'spi.components.footer.ui', 'spi.components.loader.ui', 'spi.email', 'spi.components.team-abonnieren-modal.ui', 'spi.components.bestaetigen-modal.ui'
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

    function run($rootScope, $state) {
        $rootScope.onload = function () {
            var page = document.getElementById('page');
            page.className = page.className + " loaded";
        };
    }

    function AppController($q, auth, $state, $timeout, config, $rootScope) {
        var vm = this;
        vm.runBefore = false;

        $rootScope.$on('$stateChangeStart', function (event, toState) {
            if(!_.isEqual(toState.name, 'spi.login')) {
                checkLockdown($q, auth, $state, $timeout, config, toState, $rootScope);
                auth.checkRoute($q, toState);
            }
            $rootScope.loading = true;
        });

        $rootScope.$on('$stateChangeSuccess', function () {
            $rootScope.loading = false;
        });

        $rootScope.$on('$viewContentLoading', function () {
            if(!vm.runBefore) {
                auth.checkRoute($q, $state.current);
                vm.runBefore = true;
            }

        })
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