(function () {
    'use strict';

    angular
        .module('spi.components.spieletabelle.ui', ['spi.components.jugendlabel.ui', 'spi.spiel'])
        .controller('SpieleTabellenController', SpieleTabellenController)
        .component('spiSpieleTabelle', {
            templateUrl: 'components/spieletabelle/spieletabelle.html',
            bindings: {
                spiele: '=',
                highlightedTeam: '<'
            },
            controller: 'SpieleTabellenController',
            controllerAs: 'vm'
        });

    function SpieleTabellenController($state, spiel, $rootScope) {
        const vm = this;

        _.extend(vm, {
            gotoTeam: function (team, $event) {
                if (team && team.name) {
                    gotoState('spi.event.tgj.team', {
                        teamid: team.slug || team._id
                    }, $event);
                }
            },
            gotoGruppe: function (gruppe, $event) {
                if (gruppe) {
                    gotoState('spi.event.tgj.gruppe', {
                        gruppeid: gruppe.slug || gruppe._id
                    }, $event);
                }
            },
            gotoJugend: function (jugend, $event) {
                if (jugend) {
                    gotoState('spi.event.tgj.jugend', {
                        jugendid: jugend.slug || jugend._id
                    }, $event);
                }
            },
            gotoSpiel: function (game) {
                if (game.jugend) {
                    gotoState('spi.event.spiel', {
                        spielid: game.slug || game._id
                    }, undefined);
                }
            },
            gotoPlatz: function (platznummer) {
                gotoState('spi.event.platz', {
                    platznummer: platznummer + ''
                }, undefined);
            },
            gotoDate: function (date) {
                gotoState('spi.event.datum', {
                    datum: moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD')
                }, undefined);
            },
            displayGruppe: function (game) {
                return spiel.getGruppeDisplay(game);
            },
            displayTeamA: function(game) {
                return spiel.getTeamDisplay(game, 'A');
            },
            displayTeamB: function(game) {
                return spiel.getTeamDisplay(game, 'B');
            },
            getErgebnisDisplay: function (game) {
                if (vm.isComplexMode) {
                    return game.punkteA + ' : ' + game.punkteB;
                }
                return game.toreA + ' : ' + game.toreB;
            },
            isComplexMode: $rootScope.isComplexMode
        });

        function gotoState(state, param, $event) {
            if ($event) {
                $event.stopPropagation();
            }
            $state.go(state, param);
        }
    }
})();