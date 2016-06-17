(function () {
	'use strict';

	angular
		.module('spi.verwaltung.teams.ui', [
		'spi.auth', 'ui.router', 'spi.gruppe', 'spi.jugend', 'spi.verwaltung.teams.jugendpanel.ui', 'spi.spielplan'
        ])
		.config(states)
		.controller('VerwaltungTeamsController', VerwaltungTeamsController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.verwaltung.teams', {
				url: '/teams'
				, templateUrl: 'templates/verwaltung/teams/verwaltung.teams.html'
				, controller: VerwaltungTeamsController
				, controllerAs: 'vm'
				, resolve: {
					authenticate: authenticate
				}
			});

	}

	function authenticate($q, auth, $state, $timeout) {
		if (auth.canAccess(1)) {
			return $q.when();
		} else {
			$timeout(function () {
				$state.go('spi.login');
			})

			return $q.reject();
		}
	}

	function VerwaltungTeamsController($scope, auth, $state, gruppe, jugend, spielplan) {
		var vm = this;
		vm.loading = true;

		_.extend(vm, {
			jugend: {}
			, addJugend: function () {
				jugend.create(vm.jugend).then(function (res) {
					spielplan.createSpielplan();
					vm.jugend = {};
					getAll();
				});
			}
			, isLoggedIn: auth.canAccess(1)
			, farben: [
				{
					name: 'Grün'
					, wert: 'gruen'
				}


				
				, {
					name: 'Gelb'
					, wert: 'gelb'
				}


				
				, {
					name: 'Rot'
					, wert: 'rot'
				}


				
				, {
					name: 'Blau'
					, wert: 'blau'
				}


				
				, {
					name: 'Orange'
					, wert: 'orange'
				}


				
				, {
					name: 'Lila'
					, wert: 'lila'
				}


				
				, {
					name: 'Hellblau'
					, wert: 'hellblau'
				}


				
				, {
					name: 'Hellgrün'
					, wert: 'hellgruen'
				}


				
				, {
					name: 'Hellrot'
					, wert: 'hellrot'
				}
				]
		});



		function getAll() {
			jugend.getAll().then(function (response) {
				vm.jugenden = response.data;
				vm.loading = false;
			});
		}

		getAll();
	}
})();