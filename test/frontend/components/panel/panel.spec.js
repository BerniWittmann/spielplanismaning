(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Panel', function () {
        beforeEach(module('spi.components.panel.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();

            element = $compile('<spi-panel><spi-panel-titel>TESTTITEL</spi-panel-titel><p>TESTCONTENT</p></spi-panel>')(scope);
            scope.$digest();

        }));

        it('soll den Titel im panel-title transkludieren', function () {
            var result = element.find('spi-panel-titel').text();

            expect(result).to.equal('TESTTITEL');
        });

        it('soll den Inhalt im panel-body transkludieren', function () {
            var result = element.find('p').text();

            expect(result).to.equal('TESTCONTENT');
        });
    });
}());
