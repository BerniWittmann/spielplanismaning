(function () {
	'use strict';

	angular
		.module('spi.team.deabonnieren.ui', [
		'spi.auth', 'spi.team', 'ui.router'
        ])
		.config(states)
		.controller('TeamDeabonnierenController', TeamDeabonnierenController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.team-deabonnieren', {
				url: '/teams/:teamid/deabonnieren'
				, templateUrl: 'templates/team-deabonnieren/team-deabonnieren.html'
				, controller: TeamDeabonnierenController
				, controllerAs: 'vm'
			});

	}

	function TeamDeabonnierenController(team, $stateParams, email, $state, $timeout) {
		var vm = this;
		vm.loading = true;

		team.get($stateParams.teamid).then(function (response) {
			vm.team = response;
			vm.sub = {
				team: vm.team._id
				, email: ''
			}
			vm.loading = false;
		});

		vm.abbrechen = function () {
			vm.message = undefined;
			vm.abgemeldet = false;
			vm.abgebrochen = true;
			redirect();
		}

		vm.abbestellen = function () {
			if (email.checkSubscription(vm.sub)) {
				email.removeSubscription(vm.sub).then(function (res) {
					vm.message = undefined;
					vm.abgebrochen = false;
					vm.abgemeldet = true;
					redirect();
				}, function (err) {
					console.log(err);
					vm.message = vm.sub.email + ' kann nicht abgemeldet werden. Vielleicht ist diese Email bereits abgemeldet';
				});

			} else  {
				vm.message = vm.sub.email + ' kann nicht abgemeldet werden. Vielleicht ist diese Email bereits abgemeldet';
			}
		}

		function redirect() {
			$timeout(function () {
				$state.go('spi.tgj.team', {
					teamid: vm.team._id
				});
			}, 3000);
		}
	}
})();