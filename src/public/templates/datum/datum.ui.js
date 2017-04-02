(function () {
    'use strict';

    angular
        .module('spi.templates.datum.ui', [
            'ui.router', 'spi.spiel'
        ])
        .config(states)
        .controller('DatumController', DatumController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.datum', {
                url: '/datum/:datum',
                templateUrl: 'templates/datum/datum.html',
                controller: DatumController,
                controllerAs: 'vm',
                resolve: {
                    spiele: function (spiel) {
                        return spiel.getAll();
                    }
                }
            });
    }

    function DatumController(spiele, $stateParams, errorHandler, $state) {
        const vm = this;
        vm.loading = true;

        function convertDate() {
            if (!$stateParams.datum) {
                return undefined;
            }
            const date = moment($stateParams.datum, 'YYYY-MM-DD');
            if (!date || !date.isValid()) {
                return undefined;
            }
            return date.format('DD.MM.YYYY');
        }

        vm.date = convertDate();

        if (!vm.date) {
            $state.go('spi.home');
            return errorHandler.handleResponseError({
                MESSAGE: 'Datum ungültig',
                STATUSCODE: 404,
                MESSAGEKEY: 'ERROR_DATE_INVALID'
            });
        }

        _.extend(vm, {
            spiele: _.sortBy(_.filter(spiele, {datum: vm.date}), ['datum'])
        });
        vm.loading = false;
    }
})();