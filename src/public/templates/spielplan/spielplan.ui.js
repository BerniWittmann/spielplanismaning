(function () {
    'use strict';

    angular
        .module('spi.templates.spielplan.ui', [
            'ui.router', 'ui.sortable', 'spi.spiel', 'spi.auth', 'spi.components.spielplan.singlespiel.ui'
        ])
        .config(states)
        .controller('SpielplanController', SpielplanController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.spielplan', {
                url: '/spielplan',
                templateUrl: 'templates/spielplan/spielplan.html',
                controller: SpielplanController,
                controllerAs: 'vm',
                resolve: {
                    spiele: function (spiel) {
                        return spiel.getAll();
                    }
                }
            });

    }

    function SpielplanController($state, $scope, spiele, spiel, auth) {
        var vm = this;
        vm.loading = true;
        var $jq = jQuery.noConflict();

        _.extend(vm, {
            spiele: _.sortBy(spiele, ['nummer']),
            gotoSpiel: function (gewaehltesspiel) {
                if (gewaehltesspiel.jugend) {
                    $state.go('spi.spiel', {
                        spielid: gewaehltesspiel._id
                    });
                }
            },
            spieleBackup: spiele,
            sortableOptions: {
                axis: 'y',
                disabled: true
            },
            isEditing: false,
            canEdit: auth.isAdmin(),
            toggleEdit: toggleEdit,
            saveOrder: saveOrder
        });

        function toggleEdit() {
            if (vm.canEdit) {
                vm.isEditing = !vm.isEditing;
            } else {
                vm.isEditing = false;
            }
        }

        function saveOrder () {
            return spiel.updateOrder(vm.spiele).then(function (res) {
                vm.spiele = _.sortBy(res.GAMES, ['nummer']);
                vm.isEditing = false;
            }, function () {
                vm.spiele = _.sortBy(vm.spieleBackup, ['nummer']);
                vm.isEditing = false;
            });
        }

        $scope.$watch('vm.isEditing', function (newVal) {
            vm.sortableOptions.disabled = !newVal;
        });

        vm.loading = false;
    }
})();