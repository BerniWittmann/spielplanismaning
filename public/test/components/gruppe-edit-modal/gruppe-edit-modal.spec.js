(function () {
    'use strict';

    var expect = chai.expect;

    var uibModalInstance = {
        close: function () {
        }, dismiss: function () {
        }
    };

    var state = {
        go: function () {
        }
    };

    var mockTeams = [
        {
            _id: 1,
            name: 'Test Team 1'
        },
        {
            _id: 2,
            name: 'Test Team 2'
        },
        {
            _id: 3,
            name: 'Test Team 3'
        }
    ];

    var gewGruppe = {
        name: 'Test Gruppe',
        _id: '1234',
        jugend: {
            _id: '1234',
            name: 'Test Jugend'
        }
    };

    var spielplan = {
        createSpielplan: function () {
        }
    };

    var TeamEditierenDialog = {
        open: function () {
        }
    };

    var BestaetigenDialog = {
        open: function (msg, fnct, params) {
            return fnct(params);
        }
    };

    var team;

    describe('Component: Gruppe-Edit-Modal', function () {
        beforeEach(module('spi.verwaltung.gruppe-edit-modal.ui'));
        // beforeEach(module('spi.team'));
        // beforeEach(module('spi.spielplan'));
        // beforeEach(module('spi.verwaltung.team-edit-modal.ui'));
        beforeEach(module('htmlModule'));
        var scope;
        var controller;

        beforeEach(inject(function ($rootScope, $controller, $q) {
            scope = $rootScope.$new();

            team = {
                create: function (team) {
                    return $q.when({data: team});
                },
                delete: function (team) {
                    return $q.when({data: team});
                },
                getByGruppe: function () {
                    return $q.when(mockTeams);
                }
            };

            controller = $controller('GruppeEditierenController', {
                $state: state,
                $uibModalInstance: uibModalInstance,
                team: team,
                gewGruppe: gewGruppe,
                spielplan: spielplan,
                TeamEditierenDialog: TeamEditierenDialog,
                BestaetigenDialog: BestaetigenDialog
            });

        }));

        it('sollen die vorhandenen Teams geladen werden', function () {
            controller.getTeamsByGruppe();
            scope.$apply();

            var result = controller.teams;

            expect(result.length).to.be.equal(3);
            expect(result[0].name).to.be.equal('Test Team 1');
            expect(result[1].name).to.be.equal('Test Team 2');
            expect(result[2].name).to.be.equal('Test Team 3');
        });

        it('beim Klick auf das Team, soll man zur Team-Seite weitergeleitet werden', function () {
            var spy_stateGo = chai.spy.on(state, 'go');

            controller.gotoTeam();

            expect(spy_stateGo).to.have.been.called();
        });

        it('soll ein Team hinzugefügt werden können', function () {
            var spy_teamCreate = chai.spy.on(team, 'create');

            controller.loading = false;
            controller.team = {name: 'Test Team 4'};

            controller.addTeam();
            scope.$apply();
            var result = controller.teams[3];

            expect(spy_teamCreate).to.have.been.called();
            expect(controller.teams.length).to.be.equal(4);
            expect(result.name).to.be.equal('Test Team 4');
            expect(result.gruppe).to.be.equal('1234');
            expect(result.jugend).to.be.equal('1234');
        });

        it('soll bem Erstellen eines Teams der Spielplan neu erstellt werden', function () {
            var spy_spielplan = chai.spy.on(spielplan, 'createSpielplan');

            controller.loading = false;
            controller.team = {name: 'Test Team 4'};

            controller.addTeam();
            scope.$apply();

            expect(spy_spielplan).to.have.been.called();
        });

        it('beim Klick auf Team editieren, soll sich das Team-Edit Modal öffnen', function () {
            var spy_editTeam = chai.spy.on(TeamEditierenDialog, 'open');

            controller.editTeam();

            expect(spy_editTeam).to.have.been.called();
        });

        it('soll das Team gelöscht werden können', function () {
            var spy_delete = chai.spy.on(team, 'delete');
            controller.loading = false;

            controller.askDeleteTeam(mockTeams[0]);
            scope.$apply();

            expect(spy_delete).to.have.been.called();
            expect(controller.teams.length).to.be.equal(2);
        });

        it('soll beim Löschen eines Teams ein Bestätigungsdialog erscheinen', function () {
            var spy_askDelete = chai.spy.on(BestaetigenDialog, 'open');

            controller.askDeleteTeam(mockTeams[0]);

            expect(spy_askDelete).to.have.been.called();
        });

        it('soll beim Löschen des Teams der Spielplan neu erstellt werden', function () {
            var spy_spielplan = chai.spy.on(spielplan, 'createSpielplan');
            controller.loading = false;

            controller.askDeleteTeam(mockTeams[0]);
            scope.$apply();

            expect(spy_spielplan).to.have.been.called();
        });

        it('das Modal soll abgebrochen werden können', function () {
            var spy_dismiss = chai.spy.on(uibModalInstance, 'dismiss');
            expect(spy_dismiss).not.to.have.been.called();

            controller.abbrechen();

            expect(spy_dismiss).to.have.been.called();
        });

        it('beim Bestätigen soll das Modal geschlossen werden', function () {
            var spy_close = chai.spy.on(uibModalInstance, 'close');
            expect(spy_close).not.to.have.been.called();

            controller.save();

            expect(spy_close).to.have.been.called();
        });
    });
}());