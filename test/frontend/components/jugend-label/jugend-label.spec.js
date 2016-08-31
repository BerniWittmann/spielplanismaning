(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Jugend-Label', function () {
        beforeEach(module('spi.jugenden.jugendlabel.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var $provide;
        var controller;
        var jugend = {
            _id: 123,
            teams: [
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
            ],
            gruppen: [{
                _id: 1234,
                name: 'Test Gruppe 1'
            }, {
                _id: 1235,
                name: 'Test Gruppe 2'
            }],
            name: 'Test Jugend',
            color: 'gelb'
        };

        var mockState = {
            go: function (statename, param) {
                calledState = {statename: statename, param: param};
            }
        };
        var calledState = undefined;

        beforeEach(module(function (_$provide_) {
            $provide = _$provide_;
        }));

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            scope.jugendObject = jugend;

            $provide.service('$state', function () {
                return mockState;
            });
            element = $compile('<spi-jugend-label data-jugend="jugendObject"></spi-jugend-label>')(scope);
            scope.$digest();
            controller = element.controller("spiJugendLabel");
        }));

        it('soll der Jugendname angezeigt werden', function () {
            var result = element.find('span');

            expect(result.text()).to.contain('Test Jugend');
        });

        it('soll das Label die Farbe der Jugend bekommen', function () {
            var result = element.find('span');

            expect(result.hasClass('jugend-label-gelb')).to.be.true;
        });

        it('bei einem Klick soll man zur Jugend-Seite weitergeleitet werden', function () {
            var spy_go = chai.spy.on(mockState, 'go');
            expect(spy_go).not.to.have.been.called();

            element.find('span').triggerHandler('click');

            expect(spy_go).to.have.been.called();
            expect(calledState.statename).to.be.equal('spi.tgj.jugend');
            expect(calledState.param.jugendid).to.be.equal(123);
        });
    });
}());
