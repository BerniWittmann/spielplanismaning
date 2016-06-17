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
			}
		});

	function SpielplanSingleSpielController($scope, $state, auth, spiel, Logger, BestaetigenDialog) {
		var vm = this;

		_.extend(vm, {
			isLoggedIn: auth.canAccess(0)
			, canDelete: auth.canAccess(1)
			, spiel: $scope.spiSingleSpiel
		});
		_.extend(vm.spiel, {zurückgesetzt: 0});

		_.extend(vm, {
			gotoTeam: function (team) {
				if (team) {
					$state.go('spi.tgj.team', {
						teamid: team._id
					})
				}
			}
			, gotoGruppe: function (gruppe) {
				if (gruppe) {
					$state.go('spi.tgj.gruppe', {
						gruppeid: gruppe._id
					});
				}
			}
			, gotoJugend: function (jugend) {
				if (jugend) {
					$state.go('spi.tgj.jugend', {
						jugendid: jugend._id
					});
				}
			}
			, gotoPlatz: function (platznummer) {
				$state.go('spi.platz', {
					platznummer: platznummer
				});
			}
			, deleteSpiel: function () {
				console.log('called');
				return spiel.resetSpiel(vm.spiel).then(function (res) {
					vm.spiel = res.data;
					_.extend(vm.spiel, {
						zurückgesetzt: 2
						, toreA: undefined
						, toreB: undefined
					});
				})
			}
			, askDelete: function () {
				return BestaetigenDialog.open('Wirklich dieses Ergebnis zurücksetzen?', vm.deleteSpiel);
			}
		});

		if (!vm.spiel.beendet && vm.spiel.toreA == 0 && vm.spiel.toreB == 0) {
			vm.spiel.toreA = undefined;
			vm.spiel.toreB = undefined;
		}

		var altToreA = vm.spiel.toreA;
		var altToreB = vm.spiel.toreB;

		$scope.$watch('vm.spiel.toreA', function () {
			if (vm.spiel.zurückgesetzt <= 0) {
				saveSpiel();
			}
			vm.spiel.zurückgesetzt--;
		});

		$scope.$watch('vm.spiel.toreB', function () {
			if (vm.spiel.zurückgesetzt <= 0) {
				saveSpiel();
			}
			vm.spiel.zurückgesetzt--;
		})

		function saveSpiel() {
			if (!_.isUndefined(vm.spiel.toreA) && !_.isUndefined(vm.spiel.toreB) && !_.isNull(vm.spiel.toreA) && !_.isNull(vm.spiel.toreB) && (!_.isEqual(altToreA, vm.spiel.toreA) || !_.isEqual(altToreB, vm.spiel.toreB))) {
				spiel.updateTore(vm.spiel).then(function (res) {
					//Logger.log(res);
				});

			}
		}
	}

})();