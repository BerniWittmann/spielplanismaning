(function () {
    'use strict';

    const app = angular
        .module('spi', [
            /* module-injector */
            'angulartics',
            'angulartics.google.analytics',
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
            'ui.sortable',
            'spi.veranstaltungen'
        ])
        .config(states)
        .config(toastr)
        .config(localStorage)
        .config(tooltips)
        .controller('AppController', AppController)
        .directive('ngEnter', ngEnter)
        .run(run);

    function states($urlRouterProvider, $stateProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/beachevents');

        $stateProvider
            .state('spi', {
                url: '',
                template: '<ui-view></ui-view>',
                abstract: true,
                controller: AppController,
                resolve: {
                    events: function (veranstaltungen) {
                        return veranstaltungen.getAll();
                    }
                }
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

    function run($rootScope, config) {
        $rootScope.ravenEnabled = false;
        config.getConfig().then(function (data) {
            if (data.env !== 'development') {
                $rootScope.ravenEnabled = true;
                app.requires.push('ngRaven');
            }
            $rootScope.isComplexMode = data.spielmodus === 'complex';
        });
        $rootScope.onload = function () {
            const page = document.getElementById('page');
            page.className = page.className + " loaded";
        };
    }

    function AppController($q, auth, $state, $timeout, config, $rootScope, veranstaltungen, AVAILABLE_STATES_WITHOUT_EVENT, events) {
        const vm = this;
        vm.runBefore = false;

        $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
            if (!_.isEqual(toState.name, 'spi.shared.login')) {
                checkLockdown($q, auth, $state, $timeout, config, toState, $rootScope);
                auth.checkRoute($q, toState);
            }

            if (!_.isEqual(toState.name, 'spi.shared.veranstaltungen')) {
                checkCurrentEvent(veranstaltungen, $state, AVAILABLE_STATES_WITHOUT_EVENT, toState.name, events);
            }

            if (_.includes(toState.name, 'spi.event')) {
                //Intercept route transition to add eventID to stateParams
                if (!toStateParams.eventid || toStateParams.eventid.length === 0) {
                    event.preventDefault();
                    const currentEvent = veranstaltungen.getCurrentEvent();
                    if (!currentEvent) {
                        return $state.transitionTo('spi.shared.veranstaltungen');
                    }
                    toStateParams.eventid = currentEvent.slug || currentEvent._id;
                    $state.transitionTo(toState.name, toStateParams);
                }
            }

            $rootScope.loading = true;
        });

        $rootScope.$on('$stateChangeSuccess', function () {
            $rootScope.loading = false;
        });

        $rootScope.$on('$viewContentLoading', function () {
            if (!vm.runBefore) {
                vm.runBefore = true;

                if (!_.isEqual($state.current.name, 'spi.shared.login')) {
                    auth.checkRoute($q, $state.current);
                }

                checkCurrentEvent(veranstaltungen, $state, AVAILABLE_STATES_WITHOUT_EVENT, $state.current.name, events);
            }
        });

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            console.error(error);
        });
    }

    function checkCurrentEvent(veranstaltungen, $state, AVAILABLE_STATES_WITHOUT_EVENT, toStateName, events) {
        const storedEvent = veranstaltungen.getCurrentEvent();
        let currentEvent;
        if (storedEvent && events && events.length > 0) {
            currentEvent = events.find(function (single) {
                return single._id.toString() === storedEvent._id.toString();
            });
        }
        if (!currentEvent) {
            veranstaltungen.setCurrentEvent(undefined);
            if (!_.includes(toStateName, 'spi.shared')) {
                $state.go('spi.shared.veranstaltungen');
            }
        }
    }

    function checkLockdown($q, auth, $state, $timeout, config, toState, $rootScope) {
        return config.getLockdown().then(function (res) {
            if (res.data) {
                if (_.isUndefined(toState)) {
                    toState = {
                        name: 'InitialState'
                    };
                }
                if (_.isEqual(toState.name, 'spi.shared.login') || _.isEqual(toState.name, 'spi.event.team-deabonnieren') || auth.isLoggedIn()) {
                    return $q.when();
                } else {
                    $timeout(function () {
                        $state.go('spi.shared.login');
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