(function () {
	'use strict';

	angular
		.module('spi.verwaltung.spiele-druck.ui', [
            'ui.router', 'spi.spiel'
        ])
		.config(states)
		.controller('SpieleDruckController', SpieleDruckController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.verwaltung.spiele-druck', {
				url: '/spiele-druck'
				, templateUrl: 'templates/verwaltung/alle-spiele-druck/alle-spiele-druck.html'
				, controller: SpieleDruckController
				, controllerAs: 'vm'
				, resolve: {
					authenticate: authenticate
				}
			});

	}

	function authenticate($q, auth, $state, $timeout) {
		if (auth.canAccess(0)) {
			return $q.when();
		} else {
			$timeout(function () {
				$state.go('spi.login');
			})

			return $q.reject();
		}
	}

	function SpieleDruckController($state, $scope, spiel) {
		var vm = this;
		vm.loading = true;
		vm.spiele = [];

		_.extend(vm, {
			gotoTeam: function (gewaehltesteam) {
				if (gewaehltesteam) {
					$state.go('spi.tgj.team', {
						teamid: gewaehltesteam._id
					});
				}
			}
			, gotoGruppe: function (gewaehltegruppe) {
				if (gewaehltegruppe) {
					$state.go('spi.tgj.gruppe', {
						gruppeid: gewaehltegruppe._id
					});
				}
			}
		})

		spiel.getAll().then(function (res) {
			vm.spiele = _.sortBy(res.data, ['platz', 'nummer']);
			vm.loading = false;
		});
	}
})();