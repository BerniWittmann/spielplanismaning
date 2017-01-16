(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Home', function () {
        var URL = '/home';
        var STATE_NAME = 'spi.home';

        var spiele = [{
            _id: '1',
            platz: 1,
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '2',
            platz: 2,
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '3',
            platz: 3,
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '4',
            platz: 1,
            beendet: false,
            jugend: 'jgd2'
        }, {
            _id: '5',
            platz: 2,
            beendet: false,
            jugend: 'jgd2'
        }, {
            _id: '6',
            platz: 4,
            beendet: false,
            jugend: 'jgd2'
        }];

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
        }, 'spi.templates.home.ui'));
        beforeEach(module('htmlModule'));

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

            var ctrl = scope.vm = $controller('HomeController', {
                spiele: spiele
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

        it('soll die gerade laufenden Spiele anzeigen', function () {
            render();
            _.forEach(ctrl.aktuelleSpiele, function (spiel) {
                expect(['1', '2', '3'].indexOf(spiel._id)).to.be.above(-1);
            });
        });

        it('soll die nächsten Spiele anzeigen', function () {
            render();
            _.forEach(ctrl.naechsteSpiele, function (spiel) {
                expect(['4', '5', '6'].indexOf(spiel._id)).to.be.above(-1);
            });
        });

        describe('Alle Spiele sind beendet', function () {
            before(function () {
                _.forEach(spiele, function (spiel) {
                    spiel.beendet = true;
                });
            });

            it('wenn die Spiele beendet sind werden sie nicht angezeigt', function () {
                render();

                expect(ctrl.aktuelleSpiele.length).to.be.equal(0);
                expect(ctrl.naechsteSpiele.length).to.be.equal(0);
            });
        });
    });
}());