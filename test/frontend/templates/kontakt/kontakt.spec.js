(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Kontakt', function () {
        beforeEach(module('spi.constants'));
        var URL = '/kontakt';
        var STATE_NAME = 'spi.kontakt';

        var mockKontakte = [{
            email: 'test@t.de',
            name: 'Kontakt 1',
            turnier: 'Turnier 1'
        }, {
            email: 'abc@t.de',
            name: 'Kontakt 2',
            turnier: 'Turnier 2'
        }];

        var env;

        var mockBugDialog = {
            open: function () {}
        };
        var mockConfig;
        var mockAnsprechpartner;

        function resolve(value) {
            return {forStateAndView: function (state, view) {
                var viewDefinition = view ? $state.get(state).views[view] : $state.get(state);
                var res = viewDefinition.resolve[value];
                $rootScope.$digest();
                return injector.invoke(res);
            }};
        }

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
        }, 'spi.templates.kontakt.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('config', mockConfig);
            $provide.value('ansprechpartner', mockAnsprechpartner);
        }));

        function compileRouteTemplateWithController($injector, state) {
            $rootScope = $injector.get('$rootScope');
            var $templateCache = $injector.get('$templateCache');
            var $compile = $injector.get('$compile');
            $state = $injector.get('$state');
            injector = $injector;

            var $controller = $injector.get('$controller');
            var scope = $rootScope.$new();
            var stateDetails = $state.get(state);
            var html = $templateCache.get(stateDetails.templateUrl);
            var $q = $injector.get('$q');

            mockConfig = {
                getVersion: function () {
                    return $q.when('0.0.0');
                },
                getEnv: function () {
                    return $q.when('testing');
                }
            };

            mockAnsprechpartner = {
                getAll: function () {
                    return $q.when(mockKontakte);
                }
            };

            var ctrl = scope.vm = $controller('KontaktController', {
                version: '0.0.0',
                kontakt: mockKontakte,
                env: (env || 'development'),
                BugDialog: mockBugDialog
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

        var element, render, ctrl, scope, $state, $rootScope, $controller, injector;

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
            it('soll die Kontakte resolven', function () {
                var promise = resolve('kontakt').forStateAndView('spi.kontakt');
                var res = promise.$$state.value;
                expect(res).to.deep.equal(mockKontakte);
            });

            it('soll die Version resolven', function () {
                var promise = resolve('version').forStateAndView('spi.kontakt');
                var res = promise.$$state.value;
                expect(res).to.deep.equal('0.0.0');
            });

            it('soll die Env resolven', function () {
                var promise = resolve('env').forStateAndView('spi.kontakt');
                var res = promise.$$state.value;
                expect(res).to.deep.equal('testing');
            });
        });

        it('Die Kontakte sollen geladen werden', function () {
            render();
            var table = angular.element(element[0].querySelector('#kontakte-tabelle'));
            var trLength = table.find('tr').length;
            var result = table.find('tbody').find('td');

            expect(trLength).to.be.equal(2);
            expect(angular.element(result[0]).text()).to.be.equal('Turnier 1');
            expect(angular.element(result[1]).text()).to.include('Kontakt 1');
            expect(angular.element(result[2]).text()).to.be.equal('Turnier 2');
            expect(angular.element(result[3]).text()).to.include('Kontakt 2');
        });

        describe('Testumgebung', function () {
            before(function () {
                env = 'testing';
            });
            it('Der Build Status soll auf der Testumgebung angezeigt werden', function () {
                render();
                var table = angular.element(element[0].querySelector('#build-tabelle'));

                expect(table).to.exist;
            });

            it('Die Version wird inklusive Test-Hinweis gezeigt', function () {
                render();
                var version = angular.element(element[0].querySelector('#version'));

                expect(version.text()).to.contain('0.0.0');
                expect(version.text()).to.contain('TEST');
            });
        });

        describe('Produktionsumgebung', function () {
            before(function () {
                env = 'production';
            });
            it('Der Build Status soll auf der Produktionsumgebumg versteckt werden', function () {
                render();
                var table = angular.element(element[0].querySelector('#build-tabelle'));

                expect(table).not.to.exist;
            });

            it('Die Version wird gezeigt', function () {
                render();
                var version = angular.element(element[0].querySelector('#version'));

                expect(version.text()).to.contain('0.0.0');
                expect(version.text()).not.to.contain('TEST');
                expect(version.text()).not.to.contain('Test');
                expect(version.text()).not.to.contain('test');
            });
        });

        it('das Bug-Report Modal soll sich öffnen', function () {
            render();
            var bugReportLink = angular.element(element[0].querySelector('#bug-report-link'));
            var spy = chai.spy.on(mockBugDialog, 'open');
            expect(bugReportLink).to.exist;

            bugReportLink.triggerHandler('click');

            expect(spy).to.have.been.called();
        });

    });
}());