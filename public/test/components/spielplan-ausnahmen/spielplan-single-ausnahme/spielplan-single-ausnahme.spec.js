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
                dump('Test');
                dump(controller.ausnahme);
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
            "jugend": {"_id": "1235", "name": "Test Jugend 2"},
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
                "jugend": {"_id": "1235", "name": "Test Jugend 2"},
                "gruppe": {"_id": "124", "name": "Test Gruppe 2"}
            }
        }, {
            "_id": "123456780",
            "team1": {
                "_id": "5795054f25126d0300d95525",
                "name": "Test Team 1",
                "jugend": {"_id": "1234", "name": "Test Jugend 1"},
                "gruppe": {"_id": "123", "name": "Test Gruppe 1"}
            },
            "team2": {
                "_id": "5795054f25126d0300d95527",
                "name": "Test Team 3",
                "jugend": {"_id": "1235", "name": "Test Jugend 2"},
                "gruppe": {"_id": "124", "name": "Test Gruppe 2"}
            }
        }, {
            "_id": "123456781",
            "team1": undefined,
            "team2": undefined
        }];

        var $provide;

        beforeEach(module(function (_$provide_) {
            $provide = _$provide_;
        }));

        var ausnahmeIndex = 2;
        var hB;
        var timeout;
        beforeEach(inject(function ($rootScope, $compile, $timeout, $httpBackend) {
            scope = $rootScope.$new();
            timeout = $timeout;
            scope.teams = teams;
            scope.ausnahmen = ausnahmen;
            scope.ausnahme = {};
            _.extend(scope.ausnahme, ausnahmen[ausnahmeIndex]);
            bestaetigen = {};
            $provide.service('BestaetigenDialog', function () {
                return mockBestaetigenDialog;
            });
            hB = $httpBackend;
            $provide.service('spielplan', function () {
                return mockSpielplan;
            });
            element = $compile('<spi-spielplan-single-ausnahme data-teams="teams" data-ausnahmen="ausnahmen" data-ausnahme="ausnahme"></spi-spielplan-single-ausnahme>')(scope);
            scope.$digest();
            controller = element.controller("spiSpielplanSingleAusnahme");
            $timeout.flush();
        }));

        describe('Die Ausnahmen werden geladen', function () {
            it('Die Teams werden nach Jugenden gruppiert', function () {
                _.forEach(element.find('select'), function (el) {
                    var result = angular.element(el).find('optgroup');

                    _.forEach(result, function (res, index) {
                        res = angular.element(res);

                        expect(res.attr('label')).to.be.equal('Test Jugend ' + (index + 1));
                        expect(res.html()).to.contain('Test Team ' + (index * 2 + 1));
                        expect(res.html()).to.contain('Test Team ' + (index * 2 + 2));
                    });
                });
            });

            it('Die Teams werden geladen', function () {
                _.forEach(element.find('select'), function (el) {
                    var result = angular.element(el).find('option');

                    _.forEach(result, function (res, index) {
                        res = angular.element(res);

                        //The first must be excluded
                        if (index > 0) {
                            expect(res.text()).to.contain('Test Team ' + index);
                        }
                    });
                });
            });
        });

        it('Es gibt einen Löschen-Button', function () {
            var result = element.find('span');

            expect(result).not.to.be.undefined;
            expect(result.find('i').hasClass('fa fa-remove')).to.be.true;
        });

        it('Beim Klick auf Löschen wird die Ausnahme gelöscht', function () {
            var result = element.find('span');
            var spyAsk = chai.spy.on(mockBestaetigenDialog, 'open');

            hB.when('PUT', '/api/spielplan/ausnahmen').respond('');
            result.triggerHandler('click');
            expect(controller.ausnahme).to.be.undefined;
            expect(spyAsk).to.have.been.called();
        });

        /* it('Wenn ein Team ausgewählt wird, können nur noch Teams aus anderen Jugenden ausgewählt werden', function () {
         var select1 = angular.element(element.find('select')[0]);
         var select2 = angular.element(element.find('select')[1]);
         var anzahlVorher = select2.find('option').length;

         controller.ausnahme.team1 = teams[0];
         angular.element(select1).triggerHandler('change');
         timeout.flush();
         dump(controller.teams2.length);
         var anzahlNachher = select2.find('option').length;
         expect(anzahlNachher).to.be.below(anzahlVorher);
         });*/

        /*  it('Wenn eine Ausnahme geändert wird, wird die Ausnahme gespeichert', function () {
         var select1 = angular.element(element.find('select')[1]);
         controller.ausnahme.team1 = teams[0];
         controller.ausnahme.team2 = teams[2];
         var spy = chai.spy.on(controller, 'saveAusnahme');
         scope.$apply();

         select1.triggerHandler('change');
         dump(select1);
         scope.$apply();
         dump(controller.called);

         expect(spy).to.have.been.called();
         });*/

    });
}());
