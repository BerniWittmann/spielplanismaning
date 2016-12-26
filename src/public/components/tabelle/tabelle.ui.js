(function () {
    'use strict';

    angular
        .module('spi.components.tabelle.ui', ['spi.components.jugendlabel.ui'])
        .controller('TabelleController', TabelleController)
        .component('spiTabelle', {
            templateUrl: 'components/tabelle/tabelle.html'
            , bindings: {
                teams: '<',
                highlightedTeam: '<'
            }
            , controller: 'TabelleController'
            , controllerAs: 'vm'
        });

    function TabelleController() {
        var vm = this;

        vm.$onChanges = function (changeObj) {
            if (!_.isUndefined(changeObj.teams) && !_.isUndefined(changeObj.teams.currentValue)) {
                vm.teams = changeObj.teams.currentValue.sort(compare);
            }
        };

        function compare(a, b) {
            var result = a.punkte - b.punkte;
            if (result === 0) {
                result = (a.tore - a.gtore) - (b.tore - b.gtore);
                if (result === 0) {
                    result = a.tore - b.tore;
                }
            }
            return result * -1;
        }
    }
})();