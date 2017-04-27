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
                    'showGruppe': '='
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

    function SpielplanSingleSpielController($scope, $state, auth, spiel, BestaetigenDialog, $timeout) {
        const vm = this;

        _.extend(vm, {
            canEdit: auth.isAdmin() || auth.isBearbeiter(),
            canDelete: auth.isAdmin(),
            spiel: $scope.spiSingleSpiel,
            showGruppe: $scope.showGruppe,
            showJugend: $scope.showJugend,
            isEditing: false,
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
                    $event.stopPropagation();
                    $state.go('spi.tgj.team', {
                        teamid: team._id
                    });
                }
            },
            gotoGruppe: function (gruppe, $event) {
                if (gruppe) {
                    $event.stopPropagation();
                    $state.go('spi.tgj.gruppe', {
                        gruppeid: gruppe._id
                    });
                }
            },
            gotoJugend: function (jugend, $event) {
                if (jugend) {
                    $event.stopPropagation();
                    $state.go('spi.tgj.jugend', {
                        jugendid: jugend._id
                    });
                }
            },
            gotoPlatz: function (platznummer) {
                $state.go('spi.platz', {
                    platznummer: platznummer
                });
            },
            gotoDate: function (date) {
                $state.go('spi.datum', {
                    datum: moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD')
                });
            },
            spielIsNotFilled: spielIsNotFilled()
        });

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
                    $scope.$emit('updatedTore');
                });
            }
        }

        function spielIsNotFilled() {
            const spiel = $scope.spiSingleSpiel;
            return !spiel.teamA || !spiel.teamA.name || !spiel.teamB || !spiel.teamB.name;
        }
    }

})();