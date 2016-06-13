(function () {
	'use strict';

	angular
		.module('spi.verwaltung.allgemein.ui', [
		'spi.auth', 'ui.router', 'spi.spielplan', 'spi.email'
        ])
		.config(states)
		.controller('VerwaltungAllgemeinController', VerwaltungAllgemeinController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.verwaltung.allgemein', {
				url: '/allgemein'
				, templateUrl: 'templates/verwaltung/allgemein/verwaltung.allgemein.html'
				, controller: VerwaltungAllgemeinController
				, controllerAs: 'vm'
			});

	}

	function VerwaltungAllgemeinController(auth, $state, spielplan, $scope, email) {
		var vm = this;
		vm.loading = true;
		var d = new Date();
		d.setHours(9);
		d.setMinutes(0);

		_.extend(vm, {
			user: {}
			, register: function () {
				auth.register(vm.user).error(function (error) {
					vm.error = error;
				}).then(function () {
					$state.go('spi.home');
				});
			}
			, startzeit: d
			, spielzeit: 8
			, pausenzeit: 2
			, saveSpielzeit: function () {
				spielplan.saveZeiten({
					startzeit: moment(vm.startzeit.toISOString()).format('HH:mm')
					, spielzeit: vm.spielzeit
					, pausenzeit: vm.pausenzeit
				});
			}
			, increment: function (name) {
				if (_.isEqual(name, 'spielzeit')) {
					vm.spielzeit = vm.spielzeit + 1;
				} else if (_.isEqual(name, 'pausenzeit')) {
					vm.pausenzeit = vm.pausenzeit + 1;
				}
			}
			, decrement: function (name) {
				if (_.isEqual(name, 'spielzeit')) {
					if (vm.spielzeit > 1) {
						vm.spielzeit = vm.spielzeit - 1;
					}
				} else if (_.isEqual(name, 'pausenzeit')) {
					if (vm.pausenzeit > 1) {
						vm.pausenzeit = vm.pausenzeit - 1;
					}
				}
			}
			, send: send
		});

		spielplan.getZeiten().then(function (response) {
			if (!_.isUndefined(response.data) && !_.isNull(response.data)) {
				var d = new Date();
				d.setHours(parseInt(response.data.startzeit.substring(0, 2)));
				d.setMinutes(parseInt(response.data.startzeit.substring(3, 5)));
				vm.startzeit = d;
				vm.spielzeit = response.data.spielzeit;
				vm.pausenzeit = response.data.pausenzeit;
			}
			vm.loading = false;
		});
		
		var emailBlank = {
			to: 'wittmann_b@web.de',
			subject: '',
			text: '',
			html: ''
		}
		vm.email = {};
		_.extend(vm.email, emailBlank);
		
		function send() {
			email.send(vm.email).then(function (res) {
				console.log(res);
				vm.email = emailBlank;
			});
		}
		
	}
})();