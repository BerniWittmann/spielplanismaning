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

	function VerwaltungAllgemeinController(auth, $state, spielplan, $scope, email, BestaetigenDialog) {
		var vm = this;
		vm.loading = true;
		var d = new Date();
		d.setHours(9);
		d.setMinutes(0);

		_.extend(vm, {
			user: {}
			, register: function () {
				auth.register(vm.user).error(function (error) {
					if (error.code == 11000) {
						vm.registerErr = 'Dieser Username existiert bereits';
					} else {
						vm.registerErr = error;
					}
				}).then(function () {
					vm.registerMsg = vm.user.username + ' wurde registriert.';
					vm.user = {};
				});
			}
			, startzeit: d
			, spielzeit: 8
			, pausenzeit: 2
			, saveSpielzeit: function () {
				vm.loading = true;
				spielplan.saveZeiten({
					startzeit: moment(vm.startzeit.toISOString()).format('HH:mm')
					, spielzeit: vm.spielzeit
					, pausenzeit: vm.pausenzeit
				}).then(function (res) {
					vm.loading = false;
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
			, send: function (formName) {
				if (!_.isEqual(vm.email, emailBlank)) {
					return BestaetigenDialog.open('Email wirklich an alle Abonnenten senden?', send);
				}
			}
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
			subject: ''
			, text: ''
		}
		vm.email = {};
		_.extend(vm.email, emailBlank);


		function send() {
			email.send(vm.email).error(function (err) {
				vm.err = err;
			}).then(function (res) {
				vm.message = 'Emails versendet'
				vm.email = emailBlank;
			});
		}

		vm.resetForm = function () {
			vm.message = undefined;
			vm.err = undefined;
		}

		vm.delete = function () {
			if(auth.currentUser() == vm.username) {
				return vm.delErr = 'Gerade angemeldeter User kann nicht gelöscht werden.';	
			};
			auth.deleteUser(vm.username).error(function (err) {
				vm.delErr = err;
			}).then(function (res) {
				vm.username = undefined;
				vm.delMsg = 'User gelöscht!';
			});
		}

		vm.resetDeleteForm = function () {
			vm.delErr = undefined;
			vm.delMsg = undefined;
		}

		vm.resetRegisterForm = function () {
			vm.registerErr = undefined;
			vm.registerMsg = undefined;
		}

	}
})();