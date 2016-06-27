(function () {
    'use strict';

    angular
        .module('spi.tgj.jugend.ui', [
            'spi.auth', 'spi.jugend', 'ui.router', 'spi.gruppen.gruppenpanel.ui', 'spi.spiel'
        ])
        .config(states)
        .controller('JugendController', JugendController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.tgj.jugend', {
                url: '/jugenden/:jugendid'
                , templateUrl: 'templates/tgj/jugenden/jugend/jugend.html'
                , controller: JugendController
                , controllerAs: 'vm'
            });

    }

    function JugendController(jugend, $stateParams, spiel, $scope) {
        var vm = this;
        var loadingCompleted = 0;
        $scope.loading = true;

        jugend.get($stateParams.jugendid).then(function (response) {
            vm.jugend = response;
            loadingCompleted++;
        });

        spiel.getByJugend($stateParams.jugendid).then(function (response) {
            vm.spiele = _.sortBy(response, ['nummer']);
            loadingCompleted++;
        });

        $scope.$watch(function () {
            return loadingCompleted;
        }, function () {
            if (loadingCompleted >= 2) {
                $scope.loading = false;
            }
        })
    }
})();