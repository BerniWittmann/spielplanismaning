(function () {
    'use strict';

    angular
        .module('spi.spielplan.singlespiel.ui', [
            'spi.auth', 'spi.spiel'
        ])
        .controller('SpielplanSingleSpielController', SpielplanSingleSpielController)
        .directive('spiSingleSpiel', function () {
            return {
                templateUrl: 'components/spielplan-single-spiel/spielplan-single-spiel.html'
                , restrict: 'A'
                , controller: 'SpielplanSingleSpielController'
                , controllerAs: 'vm'
                , scope: {
                    'spiSingleSpiel': '='
                }
            };
        })
        .directive("focusOn", function ($timeout) {
            return {
                restrict: "A"
                , link: function (scope, element, attrs) {
                    scope.$on(attrs.focusOn, function () {
                        $timeout((function () {
                            element[0].focus();
                        }), 10);
                    });
                }
            };
        })
        .directive('ngEnter', function () {
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
        });

    function SpielplanSingleSpielController($scope, $state, auth, spiel, BestaetigenDialog, $timeout) {
        var vm = this;

        _.extend(vm, {
            canEdit: auth.canAccess(0),
            canDelete: auth.canAccess(1),
            spiel: $scope.spiSingleSpiel,
            isEditing: false,
            edit: function () {
                if (vm.canEdit) {
                    vm.isEditing = true;
                    $timeout(function () {
                        $scope.$broadcast("focusTextInput");
                    }, 0);
                }
            },
            abort: function () {
                vm.spiel.toreA = altToreA;
                vm.spiel.toreB = altToreB;
                vm.isEditing = false;
            },
            save: saveSpiel,
            deleteSpiel: function () {
                return spiel.resetSpiel(vm.spiel).then(function (res) {
                    vm.spiel = res.data;
                    _.extend(vm.spiel, {
                        toreA: undefined
                        , toreB: undefined
                    });
                    altToreA = undefined;
                    altToreB = undefined;
                    vm.isEditing = false;
                });
            },
            askDelete: function () {
                return BestaetigenDialog.open('Wirklich dieses Ergebnis zurücksetzen?', vm.deleteSpiel);
            },
            gotoTeam: function (team) {
                if (team) {
                    $state.go('spi.tgj.team', {
                        teamid: team._id
                    });
                }
            },
            gotoGruppe: function (gruppe) {
                if (gruppe) {
                    $state.go('spi.tgj.gruppe', {
                        gruppeid: gruppe._id
                    });
                }
            },
            gotoJugend: function (jugend) {
                if (jugend) {
                    $state.go('spi.tgj.jugend', {
                        jugendid: jugend._id
                    });
                }
            },
            gotoPlatz: function (platznummer) {
                $state.go('spi.platz', {
                    platznummer: platznummer
                });
            }
        });

        if (!vm.spiel.beendet && vm.spiel.toreA === 0 && vm.spiel.toreB === 0) {
            vm.spiel.toreA = undefined;
            vm.spiel.toreB = undefined;
        }

        var altToreA = vm.spiel.toreA;
        var altToreB = vm.spiel.toreB;

        function saveSpiel() {
            if (!_.isUndefined(vm.spiel.toreA) && !_.isUndefined(vm.spiel.toreB) && !_.isNull(vm.spiel.toreA) && !_.isNull(vm.spiel.toreB) && (!_.isEqual(altToreA, vm.spiel.toreA) || !_.isEqual(altToreB, vm.spiel.toreB))) {
                spiel.updateTore(vm.spiel).then(function (res) {
                    //Logger.log(res);
                    altToreA = res.data.toreA;
                    altToreB = res.data.toreB;
                    vm.spiel = res.data;
                    vm.isEditing = false;
                });
            }
        }
    }

})();