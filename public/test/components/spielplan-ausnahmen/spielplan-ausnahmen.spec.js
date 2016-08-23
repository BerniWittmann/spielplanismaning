(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Spielplan-Ausnahmen', function () {
        beforeEach(module('spi.spielplan.ausnahmen.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var controller;
        var bestaetigen = {};
        var mockBestaetigenDialog = {
            open: function (text, fnct, param) {
                bestaetigen.text = text;
                bestaetigen.fnct = fnct;
                bestaetigen.param = param;
                fnct(param);
            }
        };
        var mockSpielplan = {
            createSpielplan: function () {
            }
        };
        var teams = [{
            "_id": "5795054f25126d0300d95525",
            "name": "Test Team 1",
            "jugend": {"_id": "1234", "name": "Test Jugend 1"},
            "gruppe": {"_id": "123", "name": "Test Gruppe 1"}
        }, {
            "_id": "5795054f25126d0300d95526",
            "name": "Test Team 2",
            "jugend": {"_id": "1234", "name": "Test Jugend 1"},
            "gruppe": {"_id": "123", "name": "Test Gruppe 1"}
        }, {
            "_id": "5795054f25126d0300d95527",
            "name": "Test Team 3",
            "jugend": {"_id": "1235", "name": "Test Jugend 2"},
            "gruppe": {"_id": "124", "name": "Test Gruppe 2"}
        }, {
            "_id": "5795054f25126d0300d95528",
            "name": "Test Team 4",
            "jugend": {"_id": "1235", "name": "Test Jugend"},
            "gruppe": {"_id": "124", "name": "Test Gruppe 2"}
        }];

        var ausnahmen = [{
            "_id": "123456789",
            "team1": {
                "_id": "5795054f25126d0300d95525",
                "name": "Test Team 1",
                "jugend": {"_id": "1234", "name": "Test Jugend 1"},
                "gruppe": {"_id": "123", "name": "Test Gruppe 1"}
            },
            "team2": {
                "_id": "5795054f25126d0300d95528",
                "name": "Test Team 4",
                "jugend": {"_id": "1235", "name": "Test Jugend"},
                "gruppe": {"_id": "124", "name": "Test Gruppe 2"}
            }
        }];

        var $provide;

        beforeEach(module(function (_$provide_) {
            $provide = _$provide_;
        }));

        beforeEach(inject(function ($rootScope, $compile, $timeout, $httpBackend) {
            scope = $rootScope.$new();
            scope.teams = teams;
            bestaetigen = {};
            $provide.service('BestaetigenDialog', function () {
                return mockBestaetigenDialog;
            });
            $provide.service('spielplan', function () {
                return mockSpielplan;
            });
            $httpBackend.when('GET', '/api/spielplan/ausnahmen').respond(ausnahmen);
            element = $compile('<spi-spielplan-ausnahmen data-teams="teams"></spi-spielplan-ausnahmen>')(scope);
            scope.$digest();
            controller = element.controller("spiSpielplanAusnahmen");
            $httpBackend.flush();
            $timeout.flush();
        }));

        it('Die Ausnahmen werden geladen', function () {
            var result = element.find('spi-spielplan-single-ausnahme').find('select');
            var teamA = findSelectedTeam(angular.element(result[0]));
            var teamB = findSelectedTeam(angular.element(result[1]));

            expect(controller.ausnahmen.length).to.be.above(0);
            expect(teamA).to.be.equal('Test Team 1');
            expect(teamB).to.be.equal('Test Team 4');
        });

        it('Es gibt einen Hinzufügen-Button', function () {
            var button = element.find('spi-panel-titel').find('span');

            expect(button).not.to.be.undefined();
        });

        it('Es kann eine neue Ausnahme hinzugefügt werden', function () {
            var button = element.find('spi-panel-titel').find('span');
            var spy = chai.spy.on(controller, 'addEmptyAusnahme');

            button.triggerHandler('click');

            expect(spy).to.have.been.called();
            expect(controller.ausnahmen.length).to.be.above(1);
        });
    });

    function findSelectedTeam(element) {
        var val = element.val();
        var els = angular.element(element.find('option'));
        var result = '';
        _.forEach(els, function (el) {
            el = angular.element(el);

            if (el.val() === val) {
                result = el.text();
            }
        });
        return result;
    }
}());
