(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Tabelle', function () {
        beforeEach(module('spi.tabelle.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var controller;
        var teams = [
            {
                _id: '1',
                name: 'Test Team 1',
                tore: 10,
                gtore: 5,
                punkte: 3,
                gpunkte: 1
            },
            {
                _id: '2',
                name: 'Test Team 2',
                tore: 20,
                gtore: 10,
                punkte: 1,
                gpunkte: 2
            },
            {
                _id: '3',
                name: 'Test Team 3',
                tore: 30,
                gtore: 5,
                punkte: 1,
                gpunkte: 2
            }
        ];
        var highlightedTeam = teams[0];

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            scope.teams = teams;
            scope.highlightedTeam = highlightedTeam;
            element = $compile('<spi-tabelle data-teams="teams" data-highlighted-team="highlightedTeam"></spi-tabelle>')(scope);
            scope.$digest();
            controller = element.controller("spiTabelle");
        }));

        it('Die Teams werden geladen', function () {
            var result = element.find('tbody').find('tr');

            expect(result.length).to.be.equal(3);
        });

        it('Die Daten der Teams werden geladen', function () {
            var result = angular.element(element.find('tbody').find('tr')[0]).find('td');

            expect(angular.element(result[0]).text()).to.be.equal('1');
            expect(angular.element(result[1]).text()).to.contain('Test Team 1');
            expect(angular.element(result[2]).text()).to.be.equal('10');
            expect(angular.element(result[3]).text()).to.be.equal('5');
            expect(angular.element(result[4]).text()).to.be.equal('5');
            expect(angular.element(result[5]).text()).to.be.equal('3');
            expect(angular.element(result[6]).text()).to.be.equal('1');
        });

        it('Die Teams werden sortiert', function () {
            var result = element.find('tbody').find('tr');

            expect(angular.element(angular.element(result[0]).find('td')[1]).text()).to.contain('Test Team 1');
            expect(angular.element(angular.element(result[1]).find('td')[1]).text()).to.contain('Test Team 3');
            expect(angular.element(angular.element(result[2]).find('td')[1]).text()).to.contain('Test Team 2');
        });

        it('das ausgewählt Team wird gehighlited', function () {
            var result = angular.element(element.find('tbody').find('tr')[0]);
            
            expect(result.hasClass('highlightTeam')).to.be.true;
        });
    });
}());
