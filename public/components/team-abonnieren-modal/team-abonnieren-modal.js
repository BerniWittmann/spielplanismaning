(function () {
	'use strict';

	angular
		.module('spi.team-abonnieren-modal.ui', [
      		'ui.bootstrap', 'ui.bootstrap.modal'
        ])
		.service('TeamAbonnierenDialog', TeamAbonnierenDialog)
		.controller('TeamAbonnierenController', TeamAbonnierenController);

	function TeamAbonnierenDialog(
		$uibModal
	) {
		return {
			open: open
		};

		function open(gewaehltesTeam) {
			return $uibModal
				.open({
					templateUrl: 'components/team-abonnieren-modal/team-abonnieren-modal.html'
					, controller: 'TeamAbonnierenController'
					, controllerAs: 'vm'
					, resolve: {
						gewTeam: function () {
							return gewaehltesTeam;
						}
					}
					, size: 'md'
				});
		}
	}

	function TeamAbonnierenController(
		$state
		, $uibModalInstance
		, gewTeam
		, email
	) {
		var vm = this;
		vm.loading = true;
		var emptymessage = {
			text: ''
			, type: ''
		};
		vm.message = emptymessage;

		_.extend(vm, {
			team: gewTeam
			, save: save
			, abbrechen: function () {
				$uibModalInstance.dismiss('cancel');
			}
			, abonnent: {
				email: ''
				, team: gewTeam._id
			}
			, addAbonnent: function (form) {
				vm.submitted = true;
				if (form.$valid) {
					email.addSubscriber(vm.abonnent).then(function (res) {
						vm.message = {
							type: 'success'
							, text: vm.team.name + ' wurde abonniert.'
						};
					}, function (err) {
						vm.message = {
							type: 'error'
							, text: err
						}
					});

				}

			}
			, resetFormValidation: function () {
				vm.submitted = false;
				vm.message = emptymessage;
			}
		});
		vm.loading = false;

		function save() {
			$uibModalInstance.close();
		}
	}
})();