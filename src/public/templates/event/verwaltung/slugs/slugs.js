(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.slugs.ui', [
            'ui.router', 'ngTable', 'spi.jugend', 'spi.team', 'spi.gruppe', 'angular-clipboard', 'spi.auth', 'spi.veranstaltungen'
        ])
        .config(states)
        .controller('SlugsContoller', SlugsContoller);

    function states($stateProvider) {
        //noinspection JSUnusedGlobalSymbols
        $stateProvider
            .state('spi.event.verwaltung.slugs', {
                url: '/slugs',
                templateUrl: 'templates/event/verwaltung/slugs/slugs.html',
                controller: SlugsContoller,
                controllerAs: 'vm',
                resolve: {
                    jugenden: function (aktivesEvent, jugend) {
                        return jugend.getAll();
                    },
                    gruppen: function (aktivesEvent, gruppe) {
                        return gruppe.getAll();
                    },
                    teams: function (aktivesEvent, team) {
                        return team.getAll();
                    }
                },
                data: {
                    requiredRoles: ['admin', 'bearbeiter']
                }
            });

    }

    function SlugsContoller(jugenden, gruppen, teams, NgTableParams, $state, $scope, auth, veranstaltungen) {
        const vm = this;
        vm.loading = true;
        const originalTooltipText = 'Klick zum Kopieren';

        _.extend(vm, {
            jugenden: jugenden,
            gruppen: gruppen.map(function (single) {
                single.jugendName = single.jugend ? single.jugend.name : ''
                return single;
            }),
            teams: teams.map(function (single) {
                single.jugendName = single.jugend ? single.jugend.name : '';
                single.gruppenName = single.gruppe ? single.gruppe.name : '';
                single.zwGruppenName = single.zwischengruppe ? single.zwischengruppe.name : '';
                return single;
            }),
            gotoTeam: function (team) {
                $state.go('spi.event.tgj.team', {
                    teamid: team.slug || team._id
                });
            },
            gotoJugend: function (jugend) {
                $state.go('spi.event.tgj.jugend', {
                    jugendid: jugend.slug || jugend._id
                });
            },
            gotoGruppe: function (gruppe) {
                $state.go('spi.event.tgj.gruppe', {
                    gruppeid: gruppe.slug || gruppe._id
                });
            },
            tooltipText: originalTooltipText,
            copied: function () {
                vm.tooltipText = 'Kopiert';
            },
            abortEdit: abortEdit,
            isEditing: false,
            canEdit: auth.isAdmin(),
            toggleEdit: toggleEdit,
            save: save
        });

        function toggleEdit() {
            if (vm.canEdit) {
                vm.isEditing = !vm.isEditing;
            }
        }

        function abortEdit() {
            $state.reload();
        }

        function save() {
            const editedSlugs = [];
            _.forEach(vm.teams, function (team) {
               editedSlugs.push({
                   type: 'team',
                   id: team._id,
                   slug: team.slug
               });
            });
            _.forEach(vm.gruppen, function (gruppe) {
                editedSlugs.push({
                    type: 'gruppe',
                    id: gruppe._id,
                    slug: gruppe.slug
                });
            });
            _.forEach(vm.jugenden, function (jugend) {
                editedSlugs.push({
                    type: 'jugend',
                    id: jugend._id,
                    slug: jugend.slug
                });
            });

            veranstaltungen.updateSlugs(editedSlugs).then(function () {
                $state.reload();
            });
        }

        _.extend(vm, {
            tableParamsJugenden: tableParams(vm.jugenden),
            tableParamsGruppen: tableParams(vm.gruppen),
            tableParamsTeams: tableParams(vm.teams),
            tooltipOpenJugenden: createTooltipOpenArray(vm.jugenden.length),
            tooltipOpenGruppen: createTooltipOpenArray(vm.gruppen.length),
            tooltipOpenTeams: createTooltipOpenArray(vm.teams.length)
        });

        function tableParams(data) {
            return new NgTableParams({
                count: 10
            }, {
                counts: [],
                data: data
            });
        }

        function createTooltipOpenArray(length) {
            return new Array(length).map(function () {
                return false;
            });
        }

        $scope.$watchCollection('vm.tooltipOpenJugenden', handleTooltipChange);
        $scope.$watchCollection('vm.tooltipOpenGruppen', handleTooltipChange);
        $scope.$watchCollection('vm.tooltipOpenTeams', handleTooltipChange);

        function handleTooltipChange(arr) {
            let result = false;
            arr.forEach(function (single) {
                if (single) result = true;
            });
            if (result) return;

            vm.tooltipText = originalTooltipText;
        }

        vm.loading = false;
    }
})();