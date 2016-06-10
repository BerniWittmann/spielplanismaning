(function () {
	'use strict';

	angular
		.module('spi.spieletabelle.ui', [])
		.controller('SpieleTabellenController', SpieleTabellenController)
		.component('spiSpieleTabelle', {
			templateUrl: 'components/spieletabelle/spieletabelle.html'
			, bindings: {
				spiele: '='
			}
			, controller: 'SpieleTabellenController'
			, controllerAs: 'vm'
		});

	function SpieleTabellenController($state, $scope) {
		var vm = this;

		_.extend(vm, {
			gotoTeam: function (team) {
				$state.go('spi.tgj.team', {
					teamid: team._id
				});
			}
			, gotoGruppe: function (gruppe) {
				$state.go('spi.tgj.gruppe', {
					gruppeid: gruppe._id
				});
			}
			, gotoJugend: function (jugend) {
				$state.go('spi.tgj.jugend', {
					jugendid: jugend._id
				});
			}
			, gotoSpiel: function (spiel) {
				if (spiel.jugend) {
					$state.go('spi.spiel', {
						spielid: spiel._id
					});
				}
			}
		});
	}
})();