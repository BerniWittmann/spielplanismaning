(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.veranstaltungen.ui', [
            'spi.auth', 'ui.router', 'spi.veranstaltungen', 'spi.components.veranstaltung-edit-modal.ui', 'spi.components.bestaetigen-modal.ui'
        ])
        .config(states)
        .controller('VerwaltungVeranstaltungenController', VerwaltungVeranstaltungenController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.shared.verwaltung.veranstaltungen', {
                url: '/veranstaltungen',
                templateUrl: 'templates/shared/verwaltung/veranstaltungen/verwaltung.veranstaltungen.html',
                controller: VerwaltungVeranstaltungenController,
                controllerAs: 'vm',
                resolve: {
                    alleVeranstaltungen: function (veranstaltungen) {
                        return veranstaltungen.getAll();
                    }
                },
                data: {
                    requiredRoles: ['admin']
                }
            });

    }

    function VerwaltungVeranstaltungenController(alleVeranstaltungen, veranstaltungen, VeranstaltungEditierenDialog, BestaetigenDialog) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            veranstaltungen: alleVeranstaltungen,
            veranstaltung: {},
            edit: function (event) {
                VeranstaltungEditierenDialog.open(_.clone(event)).result.then(function (res) {
                    vm.veranstaltungen = vm.veranstaltungen.map(function (single) {
                        return res._id === single._id ? res : single;
                    });
                });
            },
            askDeleteEvent: askDeleteEvent,
            deleteEvent: deleteEvent,
            add: function (form) {
                if (form.$valid) {
                    form.$setUntouched();
                    veranstaltungen.create(vm.veranstaltung).then(function (res) {
                        form.$setUntouched();
                        vm.veranstaltungen.push(res);
                    });
                }
            }
        });

        function askDeleteEvent(event) {
            return BestaetigenDialog.open('Event ' + event.name + ' wirklich löschen? Dabei werden alle Daten dazu ebenfalls entfernt', vm.deleteEvent, event._id);
        }

        function deleteEvent(eventid) {
            if (!vm.loading) {
                vm.loading = true;
                veranstaltungen.delete(eventid).then(function () {
                    vm.veranstaltungen = _.remove(vm.veranstaltungen, function (n) {
                        return !_.isEqual(n._id, eventid);
                    });
                    vm.loading = false;
                });
            }
        }

        vm.loading = false;
    }
})();