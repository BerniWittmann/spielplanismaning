(function () {
	'use strict';

	angular
		.module('spi.tgj.team.ui', [
		'spi.auth', 'spi.team', 'ui.router', 'spi.spiel'
        ])
		.config(states)
		.controller('TeamController', TeamController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.tgj.team', {
				url: '/teams/:teamid'
				, templateUrl: 'templates/tgj/teams/team/team.html'
				, controller: TeamController
				, controllerAs: 'vm'
			});

	}

	function TeamController(team, $stateParams, spiel, $scope) {
		var vm = this;
		var loadingCompleted = 0;
		$scope.loading = true;

		team.get($stateParams.teamid).then(function (response) {
			vm.team = response;
			loadingCompleted++;
			team.getByGruppe(vm.team.gruppe._id, vm.team.jugend._id).then(function (res) {
				vm.teams = res;
				loadingCompleted++;
			});

		});

		spiel.getByTeam($stateParams.teamid).then(function (response) {
			vm.spiele = _.sortBy(response, ['nummer']);
			loadingCompleted++;
		});
		
		$scope.$watch(function () {
			return loadingCompleted;
		}, function () {
			if (loadingCompleted >= 3) {
				$scope.loading = false;
			}
		})
	}
})();