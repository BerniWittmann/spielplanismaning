(function () {
    'use strict';

    angular
        .module('spi', [
            /* module-injector */
            'ngAnimate',
            'spi.config',
            'spi.auth',
            'spi.logger',
            'ui.router',
            'spi.components.navigation.ui',
            'spi.templates.ui',
            'spi.components.footer.ui',
            'spi.components.loader.ui',
            'spi.email',
            'spi.httpInterceptor',
            'spi.constants',
            'spi.errorHandler',
            'toastr',
            'ngMessages',
            'LocalStorageModule',
            'angular-loading-bar',
            'ui.sortable'
        ])
        .config(states)
        .config(toastr)
        .config(localStorage)
        .config(tooltips)
        .controller('AppController', AppController)
        .directive('ngEnter', ngEnter)
        .run(run);

    function states($urlRouterProvider, $stateProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('spi', {
                url: '',
                template: '<ui-view></ui-view>',
                abstract: true,
                controller: AppController
            });

        $locationProvider.html5Mode(true);
    }

    function localStorage(localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('spielplan-ismaning')
            .setStorageCookie(30, '/', true);
    }

    function tooltips($uibTooltipProvider) {
        const parser = new UAParser();
        const result = parser.getResult();
        const touch = result.device && (result.device.type === 'tablet' || result.device.type === 'mobile');

        if (touch) {
            const options = {
                trigger: 'none' // default dummy trigger event to show tooltips
            };

            $uibTooltipProvider.options(options);
        }

    }

    function toastr(toastrConfig) {
        angular.extend(toastrConfig, {
            autoDismiss: true,
            preventOpenDuplicates: true,
            closeButton: true,
            progressBar: true
        });
    }

    function run($rootScope) {
        $rootScope.onload = function () {
            const page = document.getElementById('page');
            page.className = page.className + " loaded";
        };
    }

    function AppController($q, auth, $state, $timeout, config, $rootScope) {
        const vm = this;
        vm.runBefore = false;

        $rootScope.$on('$stateChangeStart', function (event, toState) {
            if (!_.isEqual(toState.name, 'spi.login')) {
                checkLockdown($q, auth, $state, $timeout, config, toState, $rootScope);
                auth.checkRoute($q, toState);
            }
            $rootScope.loading = true;
        });

        $rootScope.$on('$stateChangeSuccess', function () {
            $rootScope.loading = false;
        });

        $rootScope.$on('$viewContentLoading', function () {
            if (!vm.runBefore) {
                if (!_.isEqual($state.current.name, 'spi.login')) {
                    auth.checkRoute($q, $state.current);
                }
                vm.runBefore = true;
            }
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

    function ngEnter() {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    }
})();