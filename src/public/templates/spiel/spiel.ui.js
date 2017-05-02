(function () {
    'use strict';

    angular
        .module('spi.templates.spiel.ui', [
            'ui.router', 'spi.spiel', 'spi.config', 'spi.auth'
        ])
        .config(states)
        .controller('SpielController', SpielController)
        .directive('flipcounter', flipcounter);

    function states($stateProvider) {
        $stateProvider
            .state('spi.spiel', {
                url: '/spiel/:spielid',
                templateUrl: 'templates/spiel/spiel.html',
                controller: SpielController,
                controllerAs: 'vm',
                resolve: {
                    aktivesSpiel: function (spiel, $stateParams) {
                        return spiel.get($stateParams.spielid);
                    },
                    spielModus: function (config) {
                        return config.getSpielmodus();
                    }
                },
                params: {
                    edit: false
                }
            });

    }

    function flipcounter() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                const options = {
                    clockFace: 'MinuteCounter',
                    autoPlay: false
                };
                _.extend(options, scope.$eval(attrs.flipcounter));
                const scoreA = scope.$eval(attrs.scorea);
                const scoreB = scope.$eval(attrs.scoreb);
                const time = 60 * scoreA + scoreB;

                let start = time - scoreB - 1;
                if (start < 0) {
                    start = 0;
                }
                const clock = $(element).FlipClock(start, options);
                clock.stop();
                if (scoreA > 0) {
                    clock.flip();
                }
                if (time > 0 && scoreB > 0) {
                    clock.setTime(time - 1);
                }
                if (scoreB > 0) {
                    clock.flip();
                }
            }
        }
    }

    function SpielController($state, aktivesSpiel, spiel, spielModus, auth, $stateParams, toastr) {
        const vm = this;
        vm.loading = true;

        if (!aktivesSpiel.complex || !aktivesSpiel.complex.hz1 || !aktivesSpiel.complex.hz2 || !aktivesSpiel.complex.hz3) {
            aktivesSpiel.complex = {
                hz1: {
                    toreA: undefined,
                    toreB: undefined
                },
                hz2: {
                    toreA: undefined,
                    toreB: undefined
                },
                hz3: {
                    toreA: undefined,
                    toreB: undefined
                }
            }
        }

        _.extend(vm, {
            spiel: aktivesSpiel,
            gotoTeam: function (team) {
                if (team) {
                    $state.go('spi.tgj.team', {
                        teamid: team._id
                    });
                }
            },
            displayGruppe: function () {
                return spiel.getGruppeDisplay(aktivesSpiel);
            },
            displayTeamA: function() {
                return spiel.getTeamDisplay(aktivesSpiel, 'A');
            },
            displayTeamB: function() {
                return spiel.getTeamDisplay(aktivesSpiel, 'B');
            },
            isComplexMode: spielModus === 'complex',
            canEdit: auth.isAdmin() || auth.isBearbeiter(),
            edit: function ()  {
                if (vm.canEdit) {
                    vm.isEditing = true;
                }
            },
            abort: function () {
                vm.spiel = _.cloneDeep(vm.backupSpiel);
                vm.isEditing = false;
            },
            save: save,
            isEditing: false,
            backupSpiel: _.cloneDeep(aktivesSpiel),
            reset: function () {
                if (vm.canEdit) {
                    return spiel.resetSpiel(vm.spiel).then(function (res) {
                        toastr.success('Spiel wurde zurückgesetzt');
                        vm.spiel = res;
                        vm.isEditing = false;
                    });
                }
            }
        });

        if (vm.canEdit) {
            vm.isEditing = $stateParams.edit || false;
        }

        function save() {
            if (vm.isComplexMode && !checkComplexData(vm.spiel.complex)) {
                return;
            }
            return spiel.updateTore(vm.spiel).then(function (res) {
                vm.backupSpiel = _.cloneDeep(res);
                vm.spiel = res;
                vm.isEditing = false;
            });
        }

        function checkHZValid(data) {
            if (!(data.toreA >= 0) || !(data.toreB >= 0)) {
                return false;
            }
            if (data.toreA === data.toreB) {
                toastr.warning('Es darf nicht Unentschieden ausgehen', 'Falsche Spiel-Daten eingegeben');
                return false;
            }
            return true;
        }

        function checkComplexData(data) {
            if (!data.hz1 || !data.hz2 || !data.hz3) {
                return false;
            }

            if (!checkHZValid(data.hz1) || !checkHZValid(data.hz2)) {
                toastr.warning('Nicht alle Felder ausgefüllt', 'Falsche Spiel-Daten eingegeben');
                return false;
            }

            const penaltyValid = checkHZValid(data.hz3);
            if (data.hz1.toreA > data.hz1.toreB && data.hz2.toreA < data.hz2.toreA || data.hz1.toreA < data.hz1.toreB && data.hz2.toreA > data.hz2.toreB) {
                if (!penaltyValid) {
                    toastr.warning('Nicht alle Felder ausgefüllt', 'Falsche Spiel-Daten eingegeben');
                    return false;
                }
            }

            return true;
        }

        vm.loading = false;
    }
})();