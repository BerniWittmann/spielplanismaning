(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Spielplan', function () {
        beforeEach(module('spi.constants'));
        var URL = '/spielplan';
        var STATE_NAME = 'spi.spielplan';

        var spiele = [{
            _id: '1',
            nummer: 1,
            platz: 1,
            beendet: false,
            jugend: {
                _id: '1',
                name: 'jgd1',
                gruppen: [{}, {}]
            }
        }, {
            _id: '2',
            nummer: 2,
            platz: 2,
            beendet: false,
            jugend: {
                _id: '1',
                name: 'jgd1',
                gruppen: [{}, {}]
            }
        }, {
            _id: '3',
            nummer: 3,
            platz: 3,
            beendet: false,
            jugend: {
                _id: '1',
                name: 'jgd1',
                gruppen: [{}, {}]
            }
        }, {
            _id: '4',
            nummer: 4,
            platz: 1,
            beendet: false,
            jugend: {
                _id: '2',
                name: 'jgd2',
                gruppen: [{}]
            }
        }, {
            _id: '6',
            nummer: 6,
            platz: 2,
            beendet: false,
            jugend: {
                _id: '2',
                name: 'jgd2',
                gruppen: [{}]
            }
        }, {
            _id: '5',
            nummer: 5,
            platz: 4,
            beendet: false,
            jugend: {
                _id: '2',
                name: 'jgd2',
                gruppen: [{}]
            }
        }];
        var zeiten = {
            startzeit: '10:00',
            spielzeit: 6,
            pausenzeit: 4,
            endzeit: '16:00',
            startdatum: '01.01.1970',
            enddatum: '31.01.2000'
        };
        var mockState = {
            go: function () {
            }
        };
        var mockAuth = {
            role: undefined,
            isAdmin: function () {
                return mockAuth.role === 'Admin';
            },
            isBearbeiter: function () {
                return true;
            }
        };

        var mockErrorHandler = {
            handleResponseError: function () {}
        };
        var mockScope = {
            $watch: function () {
            },
            $on: function () {}
        };
        var mockLogger = {
            enableLogging: function () {},
            disableLogging: function () {},
            log: function () {},
            warn: function () {}
        };
        var mockSpiele;
        var mockSpiel;
        var injector;

        function resolve(value) {
            return {forStateAndView: function (state, view) {
                var viewDefinition = view ? $state.get(state).views[view] : $state.get(state);
                var res = viewDefinition.resolve[value];
                $rootScope.$digest();
                return injector.invoke(res);
            }};
        }

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('errorHandler', mockErrorHandler);
                $provide.value('Logger', mockLogger);
            });
        });
        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
        }, 'spi.templates.spielplan.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module('spi.components.bestaetigen-modal.ui'));
        beforeEach(module(function ($provide) {
            $provide.value('spiel', mockSpiele);
        }));

        function compileRouteTemplateWithController($injector, state) {
            $rootScope = $injector.get('$rootScope');
            var $templateCache = $injector.get('$templateCache');
            var $compile = $injector.get('$compile');
            $state = $injector.get('$state');

            var $controller = $injector.get('$controller');
            var scope = $rootScope.$new();
            var stateDetails = $state.get(state);
            var html = $templateCache.get(stateDetails.templateUrl);
            var $q = $injector.get('$q');
            injector = $injector;

            var ctrl = scope.vm = $controller('SpielplanController', {
                spiele: spiele,
                $scope: mockScope,
                $state: mockState,
                spiel: mockSpiel,
                auth: mockAuth,
                anzahlPlaetze: 3,
                spielModus: 'normal',
                zeiten: zeiten
            });
            $rootScope.$digest();
            var compileFn = $compile(angular.element('<div></div>').html(html));

            mockSpiele = {
                getAll: function () {
                    return $q.when(spiele);
                },
                getGruppeDisplay: function (spiel) {
                    return 'Gruppe';
                },
                getTeamDisplay: function (spiel, letter) {
                    return spiel['team' + letter] ? spiel['team' + letter].name : '';
                }
            };

            return {
                controller: ctrl,
                scope: scope,
                render: function () {
                    var element = compileFn(scope);
                    $rootScope.$digest();
                    return element;
                }
            };
        }

        var element, render, ctrl, scope, $state, $rootScope, $controller;

        beforeEach(inject(function ($injector) {
            // Call the helper function that "creates" a page.
            // This just creates references to the attributes
            // on the returned object for use in this suite.
            var routeDetails = compileRouteTemplateWithController($injector, STATE_NAME);
            ctrl = routeDetails.controller;
            scope = routeDetails.scope;

            render = function () {
                element = routeDetails.render();
            };
        }));

        it('soll auf die URL reagieren', function () {
            expect($state.href(STATE_NAME)).to.be.equal('#' + URL);
        });

        describe('Resolves', function () {
            it('soll Spiele resolven', function () {
                var promise = resolve('spiele').forStateAndView('spi.spielplan');
                var res = promise.$$state.value;
                expect(res).to.deep.equal(spiele);
            });
        });

        it('soll die Spiele laden', function () {
            render();
            var result = element.find('tbody').find('tr');
            expect(result.length).to.be.equal(6);
        });

        it('soll die Spiele sortieren', function () {
            render();
            var index = 1;
            _.forEach(ctrl.spiele, function (spiel) {
                expect(spiel.nummer).to.be.equal(index);
                index++;
            });
        });

        it('beim Klick auf eine Zeile soll man zum Spiel weitergeleitet werden', function () {
            render();
            var spy = chai.spy.on(mockState, 'go');
            angular.element(element.find('tbody').find('tr')[0]).triggerHandler('click');
            expect(spy).to.have.been.called.with('spi.spiel', {spielid: '1'});
        });

        describe('Template: Spielplan', function () {
            before(function () {
                spiele = [];
            });

            it('Wenn keine Spiele vorhanden sind, soll ein Hinweis angezeigt werden', function () {
                render();
                expect(element.find('tbody')).not.to.exist;
                var alert = element.find('div.alert');
                expect(alert).to.exist;
                expect(alert.text()).to.equal('Keine Spiele gefunden.');
            });
        });

        describe('es soll ein Button zum Bearbeiten des Spielplans existieren', function () {

            it('für nicht eingeloggte User soll der Button nicht sichtbar sein', function () {
                mockAuth.role = undefined;
                render();
                expect(element.find('.page-header').find('button.btn')).not.to.exist;
            });

            it('für Bearbeiter soll der Button nicht sichtbar sein', function () {
                mockAuth.role = 'Bearbeiter';
                render();
                expect(element.find('.page-header').find('button.btn')).not.to.exist;
            });

            it('für Admins soll der Button sichtbar sein', function () {
                mockAuth.role = 'Admin';
                ctrl.canEdit = mockAuth.isAdmin;

                render();
                scope.$apply();
                var button = element.find('.page-header').find('button.btn');

                button.triggerHandler('click');
                scope.$apply();

                expect(button).to.exist;
            });

            it('Beim Klick auf den Spielplan bearbeiten Button soll man in den Editiermodus kommen', function () {
                mockAuth.role = 'Admin';
                ctrl.canEdit = mockAuth.isAdmin;

                render();
                scope.$apply();
                var button = element.find('.page-header').find('button.btn');

                button.triggerHandler('click');
                scope.$apply();

                expect(ctrl.isEditing).to.be.true;
            });
        })

    });
}());