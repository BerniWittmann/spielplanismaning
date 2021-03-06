(function () {
    'use strict';

    angular
        .module('spi.components.spielplan.singlespiel.ui', [
            'spi.auth', 'spi.spiel', 'spi.components.bestaetigen-modal.ui'
        ])
        .controller('SpielplanSingleSpielController', SpielplanSingleSpielController)
        .directive('spiSingleSpiel', function () {
            return {
                templateUrl: 'components/spielplan-single-spiel/spielplan-single-spiel.html',
                restrict: 'A',
                controller: 'SpielplanSingleSpielController',
                controllerAs: 'vm',
                scope: {
                    'spiSingleSpiel': '=',
                    'showJugend': '=',
                    'showGruppe': '=',
                    'isComplexMode': '=',
                    'isEditing': '=',
                    'isLastPlatz': '='
                }
            };
        })
        .directive("focusOn", function ($timeout) {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    scope.$on(attrs.focusOn, function () {
                        $timeout((function () {
                            element[0].focus();
                        }), 10);
                    });
                }
            };
        });

    function SpielplanSingleSpielController($scope, $state, auth, spiel, BestaetigenDialog, $timeout, $rootScope) {
        const vm = this;

        _.extend(vm, {
            canEdit: (auth.isAdmin() || auth.isBearbeiter()) && isSpielplanEnabled(),
            canDelete: auth.isAdmin(),
            spiel: $scope.spiSingleSpiel,
            showGruppe: $scope.showGruppe,
            showJugend: $scope.showJugend,
            isComplexMode: $scope.isComplexMode,
            isEditing: false,
            spielplanIsEdited: $scope.isEditing,
            delay: 0,
            displayGruppe: function () {
                return spiel.getGruppeDisplay($scope.spiSingleSpiel);
            },
            displayTeamA: function() {
                return spiel.getTeamDisplay($scope.spiSingleSpiel, 'A');
            },
            displayTeamB: function() {
                return spiel.getTeamDisplay($scope.spiSingleSpiel, 'B');
            },
            edit: function () {
                if (vm.canEdit) {
                    if (vm.isComplexMode) {
                        return $state.go('spi.event.spiel', {
                            spielid: $scope.spiSingleSpiel.slug || $scope.spiSingleSpiel._id,
                            edit: true
                        });
                    }
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
                    vm.spiel = res;
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
            gotoTeam: function (team, $event) {
                if (team && team.name) {
                    gotoState('spi.event.tgj.team', {
                        teamid: team.slug || team._id
                    }, $event);
                }
            },
            gotoGruppe: function (gruppe, $event) {
                if (gruppe) {
                    gotoState('spi.event.tgj.gruppe', {
                        gruppeid: gruppe.slug || gruppe._id
                    }, $event);
                }
            },
            gotoJugend: function (jugend, $event) {
                if (jugend) {
                    gotoState('spi.event.tgj.jugend', {
                        jugendid: jugend.slug || jugend._id
                    }, $event);
                }
            },
            gotoPlatz: function (platznummer) {
                gotoState('spi.event.platz', {
                    platznummer: platznummer
                }, undefined);
            },
            gotoDate: function (date) {
                gotoState('spi.event.datum', {
                    datum: moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD')
                }, undefined)
            },
            spielIsNotFilled: spielIsNotFilled(),
            ergebnisDisplayPoints: '   :   ',
            ergebnisDisplayTore: undefined,
            removeSpiel: function () {
                $scope.$emit('removeSpiel', vm.spiel._id);
            },
            isLastPlatz: $scope.isLastPlatz,
            delaySpiel: delaySpiel,
            delayChangeHandle: delayChangeHandle
        });

        function calcErgebnisDisplay() {
            if (!vm.spiel.beendet) {
                vm.ergebnisDisplayPoints = '   :   ';
                vm.ergebnisDisplayTore = undefined;
                return;
            }

            vm.ergebnisDisplayPoints = vm.spiel.punkteA + ' : ' + vm.spiel.punkteB;
            vm.ergebnisDisplayTore = '(' + vm.spiel.toreA + ' : ' + vm.spiel.toreB + ')';
        }

        function isSpielplanEnabled() {
            return $rootScope.spielplanEnabled;
        }

        calcErgebnisDisplay();

        function gotoState(state, param, $event) {
            if ($event) {
                $event.stopPropagation();
            }
            $state.go(state, param);
        }


        if (!vm.spiel.beendet && vm.spiel.toreA === 0 && vm.spiel.toreB === 0) {
            vm.spiel.toreA = undefined;
            vm.spiel.toreB = undefined;
        }

        let altToreA = vm.spiel.toreA;
        let altToreB = vm.spiel.toreB;

        function saveSpiel() {
            if (!_.isUndefined(vm.spiel.toreA) && !_.isUndefined(vm.spiel.toreB) && !_.isNull(vm.spiel.toreA) && !_.isNull(vm.spiel.toreB) && (!_.isEqual(altToreA, vm.spiel.toreA) || !_.isEqual(altToreB, vm.spiel.toreB))) {
                spiel.updateTore(vm.spiel).then(function (res) {
                    //Logger.log(res);
                    altToreA = res.toreA;
                    altToreB = res.toreB;
                    vm.spiel = res;
                    vm.isEditing = false;
                    calcErgebnisDisplay();
                    $scope.$emit('updatedTore');
                });
            }
        }

        function spielIsNotFilled() {
            const spiel = $scope.spiSingleSpiel;
            return !spiel.teamA || !spiel.teamA.name || !spiel.teamB || !spiel.teamB.name;
        }

        function delaySpiel() {

        }

        $scope.$watch('isLastPlatz', function () {
            vm.isLastPlatz = $scope.isLastPlatz
        });

        function delayChangeHandle() {
            $scope.$emit('delayChanged', {delay: vm.delay, spiel: vm.spiel})
        }
    }

})();