(function () {
	'use strict';

	angular
		.module('spi.login.ui', [
		'spi.auth'


				
			, 'ui.router'
        ])
		.config(states)
		.controller('LoginController', LoginController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.login', {
				url: '/login'
				, templateUrl: 'templates/login/login.html'
				, controller: LoginController
				, controllerAs: 'vm'
			});

	}

	function LoginController(auth, $state) {
		var vm = this;

		vm.user = {};
		vm.register = function () {
			vm.user.username = vm.user.username.toLowerCase();
			auth.register(vm.user).error(function (error) {
				vm.error = error;
			}).then(function () {
				$state.go('spi.home');
			});
		};
		vm.login = function () {
			vm.user.username = vm.user.username.toLowerCase();
			auth.logIn(vm.user).error(function (error) {
				vm.error = error;
			}).then(function () {
				$state.go('spi.home');
			});
		};
	}
})();