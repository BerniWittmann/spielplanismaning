(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Verwaltung Allgemein', function () {
        var URL = '/allgemein';
        var STATE_NAME = 'spi.verwaltung.allgemein';

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.verwaltung', {abstract: true});
        }, 'spi.templates.verwaltung.allgemein.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('spielplan', mockSpielplan);
        }));

        var mockAuth;
        var mockSpielplan = {
            zeiten: {
                startzeit: '10:00',
                spielzeit: 6,
                pausenzeit: 4
            }
        };
        var form = {$valid: true};
        var injector;

        function resolve(value) {
            return {forStateAndView: function (state, view) {
                var viewDefinition = view ? $state.get(state).views[view] : $state.get(state);
                var res = viewDefinition.resolve[value];
                $rootScope.$digest();
                return injector.invoke(res);
            }};
        }

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
            $httpBackend = $injector.get('$httpBackend');
            mockAuth = {
                bereitsRegistriert: false,
                register: function () {
                    var deferred = $q.defer();
                    if (mockAuth.bereitsRegistriert) {
                        deferred.reject({ERROR: {code: 11000}});
                    } else {
                        deferred.resolve();
                    }
                    return deferred.promise;
                },
                currentUser: function () {
                    return 'Test'
                },
                deleteUser: function () {
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                }
            };
            _.extend(mockSpielplan, {
                getZeiten: function () {
                    var deferred = $q.defer();
                    deferred.resolve(mockSpielplan.zeiten);
                    return deferred.promise;
                },
                saveZeiten: function (zeiten) {
                    mockSpielplan.zeiten = zeiten;
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                }
            });

            var ctrl = scope.vm = $controller('VerwaltungAllgemeinController', {
                auth: mockAuth,
                spielplan: mockSpielplan,
                zeiten: mockSpielplan.zeiten
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

        var element, render, ctrl, scope, $state, $rootScope, $controller, $httpBackend;

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
            it('soll die Zeiten resolven', function () {
                var promise = resolve('zeiten').forStateAndView('spi.verwaltung.allgemein');
                var res = promise.$$state.value;
                expect(res).to.deep.equal(mockSpielplan.zeiten);
            });
        });

        it('Es werden die Zeiten geladen', function () {
            render();
            var startzeit = moment(ctrl.startzeit.toISOString()).format('HH:mm');
            expect(startzeit).to.be.equal('10:00');
            expect(ctrl.spielzeit).to.be.equal(6);
            expect(ctrl.pausenzeit).to.be.equal(4);
        });

        it('Die Zeiten können gespeichert werden', function () {
            render();
            ctrl.startzeit.setHours(9);
            ctrl.startzeit.setMinutes(30);
            ctrl.spielzeit = 7;
            ctrl.pausenzeit = 3;

            ctrl.saveSpielzeit(form);
            scope.$digest();

            expect(mockSpielplan.zeiten).to.deep.equal({startzeit: '09:30', spielzeit: 7, pausenzeit: 3});
            expect(element.find('input[name="spielzeit"]').val()).to.be.equal('7');
            expect(element.find('input[name="pausenzeit"]').val()).to.be.equal('3');
        });

        it('soll einen Nutzer registrieren können', function () {
            render();
            ctrl.user = {
                username: 'Test',
                email: 'test1234@byom.de',
                role: 'Bearbeiter'
            };
            var spy = chai.spy.on(mockAuth, 'register');

            ctrl.register(form);
            scope.$digest();

            expect(spy).to.have.been.called();
            var result = element.find('.alert-success');
            expect(result).to.exist;
            expect(result.text()).to.contain('Test wurde registriert');
        });

        it('Wenn der Nutzer bereits vorhanden ist, soll ein Fehler angezeigt werden', function () {
            mockAuth.bereitsRegistriert = true;
            render();
            ctrl.user = {
                username: 'Test',
                email: 'test123@byom.de',
                role: 'Bearbeiter'
            };

            ctrl.register(form);
            scope.$digest();

            var result = element.find('.alert-danger');
            expect(result).to.exist;
            expect(result.text()).to.contain('Dieser Username oder diese Email existiert bereits');
        });

        it('soll einen Nutzer löschen können', function () {
            render();
            ctrl.username = 'Berni';
            var spy = chai.spy.on(mockAuth, 'deleteUser');

            ctrl.delete(form);
            scope.$digest();

            expect(spy).to.have.been.called();
            var result = element.find('.alert-success');
            expect(result).to.exist;
            expect(result.text()).to.contain('User gelöscht!');
        });

        it('Wenn der Nutzer gerade angemeldet ist, kann er nicht gelöscht werden', function () {
            render();
            ctrl.username = 'Test';

            ctrl.delete(form);
            scope.$digest();

            var result = element.find('.alert-danger');
            expect(result).to.exist;
            expect(result.text()).to.contain('Gerade angemeldeter User kann nicht gelöscht werden.');
        });
    });
}());