(function () {
    'use strict';

    angular
        .module('spi.components.tabelle.ui', ['spi.components.jugendlabel.ui'])
        .controller('TabelleController', TabelleController)
        .component('spiTabelle', {
            templateUrl: 'components/tabelle/tabelle.html',
            bindings: {
                teams: '<',
                highlightedTeam: '<',
                key: '<'
            },
            controller: 'TabelleController',
            controllerAs: 'vm'
        });

    function TabelleController() {
        const vm = this;

        if (!vm.key) {
            vm.key = 'all';
        }

        vm.checkIsHighlighted = function (team) {
            if (!team || !vm.highlightedTeam) return false;
            return team._id.toString() === vm.highlightedTeam._id.toString();
        };

        vm.$onChanges = function (changeObj) {
            if (!_.isUndefined(changeObj.teams) && !_.isUndefined(changeObj.teams.currentValue)) {
                vm.teams = changeObj.teams.currentValue.filter(function (single) {
                    return single && !single.isPlaceholder;
                }).map(function (single) {
                    if (!single.ergebnisse || !single.ergebnisse[vm.key]) return single;
                    const results = single.ergebnisse[vm.key];
                    single.punkte = results.punkte;
                    single.gpunkte = results.gpunkte;
                    single.tore = results.tore;
                    single.gtore = results.gtore;
                    single.spiele = results.spiele;
                    return single;
                });
            }
        };
    }
})();