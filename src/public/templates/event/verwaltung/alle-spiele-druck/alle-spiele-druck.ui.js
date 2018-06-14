(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.spiele-druck.ui', [
            'ui.router', 'spi.spiel', 'spi.auth', 'spi.config'
        ])
        .config(states)
        .controller('SpieleDruckController', SpieleDruckController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.event.verwaltung.spiele-druck', {
                url: '/spiele-druck',
                templateUrl: 'templates/event/verwaltung/alle-spiele-druck/alle-spiele-druck.html',
                controller: SpieleDruckController,
                controllerAs: 'vm',
                resolve: {
                    spiele: function (aktivesEvent, spiel) {
                        return spiel.getAll();
                    },
                    mannschaftslisten: function (aktivesEvent, config) {
                        return config.getMannschaftslisten();
                    }
                },
                data: {
                    requiredRoles: ['bearbeiter', 'admin']
                }
            });

    }

    function SpieleDruckController($state, spiele, spiel, $scope, $rootScope, mannschaftslisten) {
        const vm = this;
        vm.loading = true;

        vm.mode = 'all';
        _.extend(vm, {
            spiele: getSpiele(spiele),
            gotoTeam: function (gewaehltesteam) {
                if (gewaehltesteam && gewaehltesteam.name) {
                    $state.go('spi.event.tgj.team', {
                        teamid: gewaehltesteam.slug || gewaehltesteam._id
                    });
                }
            },
            gotoGruppe: function (gewaehltegruppe) {
                if (gewaehltegruppe) {
                    $state.go('spi.event.tgj.gruppe', {
                        gruppeid: gewaehltegruppe.slug || gewaehltegruppe._id
                    });
                }
            },
            displayGruppe: function (game) {
                return spiel.getGruppeDisplay(game);
            },
            displayTeamA: function (game) {
                return spiel.getTeamDisplay(game, 'A');
            },
            displayTeamB: function (game) {
                return spiel.getTeamDisplay(game, 'B');
            },
            isComplexMode: $rootScope.isPrintComplexMode,
            mannschaftslistenEnabled: mannschaftslisten.toString() === 'true',
            getSpielerArray: function (team) {
                if (!team || !team.anmeldungsObject || !team.anmeldungsObject.players) {
                    return new Array(14);
                }

                return fillUpSpieler(team.anmeldungsObject.players);
            },
            minNummer: undefined,
            maxNummer: undefined,
            getPlayerBirthDate: function (date) {
                return moment(date, 'YYYY-MM-DD').format('DD.MM.YYYY');
            }
        });

        function getSpiele(games) {
            return _.orderBy(_.filter(games, function (spiel) {
                if (vm.mode === 'nichtBeendete' && spiel.beendet) {
                    return false;
                }
                if (vm.mode === 'withoutPlaceholder') {
                    if (!spiel.teamA || !spiel.teamB) return false;
                }

                if (vm.minNummer && spiel.nummer < vm.minNummer) {
                    return false;
                }
                if (vm.maxNummer && spiel.nummer > vm.maxNummer) {
                    return false;
                }

                return spiel.teamA || spiel.teamB || spiel.fromA || spiel.fromB;
            }), ['platz', 'nummer'], ['asc', 'asc'])
        }

        function fillUpSpieler(spieler) {
            if (spieler.length >= 14) {
                return _.sortBy(spieler.slice(0, 14), 'number');
            }
            const length = Math.max(14 - spieler.length, 0);
            return _.sortBy(spieler.concat(new Array(length)), 'number');
        }

        $scope.$watchGroup(['vm.mode', 'vm.minNummer', 'vm.maxNummer'], function () {
            vm.spiele = getSpiele(spiele);
        });

        $scope.trackSpielerFunction = function (spiel, team, letter) {
            let teamID;
            if (team) {
                teamID = team._id;
            }
            if (!teamID) {
                teamID = spiel['from' + letter] + spiel['rank' + letter];
            }
            return spiel._id + ':' + teamID + ':';
        };

        vm.loading = false;
    }
})();