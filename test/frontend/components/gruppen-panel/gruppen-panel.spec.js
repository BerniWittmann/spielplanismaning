(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Gruppen-Panel', function () {
        beforeEach(module('spi.components.gruppenpanel.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var controller;
        var gruppe = {
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
            jugend: {
                _id: 1234,
                name: 'Test Jugend'
            },
            name: 'Test Gruppe'
        };

        beforeEach(inject(function ($rootScope, $compile, $q) {
            scope = $rootScope.$new();
            scope.gruppeObject = gruppe;
            
            element = $compile('<spi-gruppen-panel data-gruppe="gruppeObject"></spi-gruppen-panel>')(scope);
            scope.$digest();
            controller = element.controller("spiGruppenPanel");
        }));

        it('soll im Titel der Gruppenname angezeigt werden', function () {
            var result = element.find('spi-panel-titel').text();

            expect(result).to.contain('Test Gruppe');
        });

        describe('soll im Titel die Jugend angezeigt werden', function () {
            it('soll das Jugend-Label erscheinen', function () {
                var titel = element.find('spi-panel-titel');

                expect(titel.html()).to.contain('<spi-jugend-label');
                expect(titel.html()).to.contain('</spi-jugend-label>');
            });

            it('soll die Jugend an das Jugend-Label übergeben werden', function () {
                expect(controller.gruppe.jugend).not.to.be.undefined;
                expect(controller.gruppe.jugend._id).to.be.equal(1234);
                expect(controller.gruppe.jugend.name).to.be.equal('Test Jugend');
            });
        });

        it('die Teams der Gruppe sollen geladen werden', function () {
            var result = element.find('tbody').children();

            expect(result).not.to.be.undefined;
            expect(result.length).to.be.equal(3);

            expect(angular.element(result[0]).find('a').text()).to.be.equal('Test Team 1');
            expect(angular.element(result[1]).find('a').text()).to.be.equal('Test Team 2');
            expect(angular.element(result[2]).find('a').text()).to.be.equal('Test Team 3');
        });

        it('die Teams sollen einen Link auf die entsprechende Team-Seite haben', function () {
            var result = element.find('tbody').children();

            expect(angular.element(result[0]).html()).to.contain('data-ui-sref="spi.event.tgj.team({teamid: team.slug || team._id})"');
            expect(angular.element(result[1]).html()).to.contain('data-ui-sref="spi.event.tgj.team({teamid: team.slug || team._id})"');
            expect(angular.element(result[2]).html()).to.contain('data-ui-sref="spi.event.tgj.team({teamid: team.slug || team._id})"');
        });
    });
}());
