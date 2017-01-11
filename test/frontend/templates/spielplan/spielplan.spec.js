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
            jugend: 'jgd1'
        }, {
            _id: '2',
            nummer: 2,
            platz: 2,
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '3',
            nummer: 3,
            platz: 3,
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '4',
            nummer: 4,
            platz: 1,
            beendet: false,
            jugend: 'jgd2'
        }, {
            _id: '6',
            nummer: 6,
            platz: 2,
            beendet: false,
            jugend: 'jgd2'
        }, {
            _id: '5',
            nummer: 5,
            platz: 4,
            beendet: false,
            jugend: 'jgd2'
        }];
        var mockState = {
            go: function () {
            }
        };

        var mockErrorHandler = {
            handleResponseError: function () {}
        };

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('errorHandler', mockErrorHandler);
            });
        });
        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
        }, 'spi.templates.spielplan.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module('spi.logger'));
        beforeEach(module('spi.components.bestaetigen-modal.ui'));

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

            var ctrl = scope.vm = $controller('SpielplanController', {
                spielPromise: {data: spiele},
                $state: mockState,
                errorHandler: mockErrorHandler
            });
            $rootScope.$digest();
            var compileFn = $compile(angular.element('<div></div>').html(html));

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
    });
}());