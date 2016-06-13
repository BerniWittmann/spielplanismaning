(function () {
	'use strict';

	angular
		.module('spi.footer.ui', [])
		.directive('spiFooter', spiFooter)
		.controller('FooterController', FooterController);

	function spiFooter() {
		return {
			restrict: 'E'
			, templateUrl: 'templates/footer/footer.html'
			, scope: true
			, controller: FooterController
			, controllerAs: 'vm'
		};
	}

	function FooterController($state, $http) {
		var vm = this;
		vm.version = '';

		$http.get('/config/version').then(function (res) {
			vm.version = res.data;
		});

	}


})();