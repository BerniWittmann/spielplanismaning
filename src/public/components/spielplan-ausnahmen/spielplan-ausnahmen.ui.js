(function () {
    'use strict';

    angular
        .module('spi.components.spielplan.ausnahmen.ui', ['spi.components.spielplan.ausnahme.single.ui'])
        .controller('SpielplanAusnahmenController', SpielplanAusnahmenController)
        .component('spiSpielplanAusnahmen', {
            templateUrl: 'components/spielplan-ausnahmen/spielplan-ausnahmen.html',
            bindings: {
                teams: '<'
            },
            controller: 'SpielplanAusnahmenController',
            controllerAs: 'vm'
        });

    function SpielplanAusnahmenController($scope, $http, $timeout) {
        var vm = this;
        var singleAusnahme = {
            team1: undefined,
            team2: undefined
        };

        _.extend(vm, {
            ausnahmen: [],
            addEmptyAusnahme: addEmptyAusnahme
        });

        function addEmptyAusnahme() {
            var o = {};
            _.extend(o, singleAusnahme);
            vm.ausnahmen.push(o);
        }

        getAusnahmen();

        function getAusnahmen() {
            return $http.get('/api/spielplan/ausnahmen').then(function (res) {
                $timeout(function () {
                    $scope.$apply(function () {
                        vm.ausnahmen = res.data;
                    });
                }, 0, false);
                return res.data;
            });
        }
    }
})();