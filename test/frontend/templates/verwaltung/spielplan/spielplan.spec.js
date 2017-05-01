(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Verwaltung Spielplan', function () {
        var URL = '/spielplan';
        var STATE_NAME = 'spi.verwaltung.spielplan';

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.verwaltung', {abstract: true});
        }, 'spi.templates.verwaltung.spielplan.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('spielplan', mockSpielplan);
            $provide.value('spiel', mockSpiel);
        }));

        var mockSpielplan = {
            zeiten: {
                startzeit: '10:00',
                spielzeit: 6,
                pausenzeit: 4,
                endzeit: '16:00',
                startdatum: '01.01.1970',
                enddatum: '31.01.2000'
            },
            createSpielplan: function () {},
            regenerateSpielplan: function () {}
        };
        var mockSpiel = {
            spiele: [{
                label: 'normal', beendet: false
            },{
                label: 'normal', beendet: false
            }],
            getAll: function () {
                return mockSpiel.spiele
            }
        };
        var mockToastr = {
            warning: function() {},
            success: function() {}
        };
        var form = {$valid: true, $setUntouched: function () {}};
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

            var ctrl = scope.vm = $controller('VerwaltungSpielplanController', {
                spielplan: mockSpielplan,
                zeiten: mockSpielplan.zeiten,
                spiele: mockSpiel.spiele,
                $scope: scope,
                toastr: mockToastr
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
                var promise = resolve('zeiten').forStateAndView('spi.verwaltung.spielplan');
                var res = promise.$$state.value;
                expect(res).to.deep.equal(mockSpielplan.zeiten);
            });
        });

        it('Es werden die Zeiten geladen', function () {
            render();
            var startzeit = moment(ctrl.startzeit.toISOString()).format('HH:mm');
            expect(startzeit).to.be.equal('10:00');
            var endzeit = moment(ctrl.endzeit.toISOString()).format('HH:mm');
            expect(endzeit).to.be.equal('16:00');
            expect(ctrl.spielzeit).to.be.equal(6);
            expect(ctrl.pausenzeit).to.be.equal(4);
            expect(ctrl.startdate).to.be.equal('01.01.1970');
            expect(ctrl.enddate).to.be.equal('31.01.2000');
        });

        it('Die Zeiten können gespeichert werden', function () {
            render();
            ctrl.startzeit.setHours(9);
            ctrl.startzeit.setMinutes(30);
            ctrl.endzeit.setHours(17);
            ctrl.endzeit.setMinutes(30);
            ctrl.spielzeit = 7;
            ctrl.pausenzeit = 3;
            ctrl.startdate = '02.02.1980';
            ctrl.enddate = '01.03.2001';

            ctrl.saveSpielzeit(form);
            scope.$digest();

            expect(mockSpielplan.zeiten).to.deep.equal({
                startzeit: '09:30',
                spielzeit: 7,
                pausenzeit: 3,
                endzeit: '17:30',
                startdatum: '02.02.1980',
                enddatum: '01.03.2001'
            });
            expect(element.find('input[name="spielzeit"]').val()).to.be.equal('7');
            expect(element.find('input[name="pausenzeit"]').val()).to.be.equal('3');
        });

        it('wenn die Startzeit nach der Endzeit liegt soll ein Fehler angezeigt werden', function () {
            var d1 = new Date();
            d1.setHours(17);
            d1.setMinutes(30);
            var d2 = d1;
            d2.setHours(11);
            ctrl.endzeit = d2;
            ctrl.startzeit = d1;

            expect(ctrl.startzeit).to.equal(ctrl.endzeit);
        });

        it('Soll einen Button zur Generierung des Spielplans haben', function () {
            render();
            var spySpielplan = chai.spy.on(mockSpielplan, 'createSpielplan');
            var btn = element.find('#generate-spielplan-btn');
            expect(btn).to.exist;
            expect(btn.text()).to.equal('Spielplan neu generieren');

            ctrl.generateSpielplan();
            scope.$digest();
            expect(spySpielplan).to.have.been.called();
        });

        it('Soll einen Button zur Generierung mit Erhalt beendeter Spiele haben', function () {
            render();
            var spySpielplan = chai.spy.on(mockSpielplan, 'regenerateSpielplan');
            var btn = element.find('#regenerate-spielplan-btn');
            expect(btn).to.exist;
            expect(btn.text()).to.equal('Spielplan generieren (mit Erhalt beendeter Spiele)');

            ctrl.regenerateSpielplan();
            scope.$digest();
            expect(spySpielplan).to.have.been.called();
        });
    });
}());