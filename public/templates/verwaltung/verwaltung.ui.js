(function () {
	'use strict';

	angular
		.module('spi.verwaltung.ui', [
		'spi.auth', 'spi.verwaltung.allgemein.ui', 'spi.verwaltung.teams.ui', 'spi.verwaltung.spiele-druck.ui'
			
			, 'ui.router'
        ])
		.config(states);

	function states($stateProvider) {
		$stateProvider
			.state('spi.verwaltung', {
				url: '/verwaltung'
				, abstract: true
				, template: '<ui-view></ui-view>'
				, resolve: {
					authenticate: authenticate
				}
			});
	}

	function authenticate($q, auth, $state, $timeout) {
		if (auth.isLoggedIn()) {
			return $q.when();
		} else {
			$timeout(function () {
				$state.go('spi.login');
			})

			return $q.reject();
		}
	}
})();