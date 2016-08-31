(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Loader', function () {
        beforeEach(module('spi.loader.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();

            element = $compile('<spi-loader data-loading="loading"></spi-loader>')(scope);
            scope.$digest();
        }));
        describe('Es wird gerade geladen', function () {
            beforeEach(inject(function () {
                scope.loading = true;
                scope.$digest();
            }));

            it('der Loader wird angezeigt', function () {
                var result = element.find('i');

                expect(result).not.to.be.undefined;
                expect(result.hasClass('fa-spinner')).to.be.true;
            });
        });

        describe('Es wird gerade nicht geladen', function () {
            beforeEach(inject(function () {
                scope.loading = false;
                scope.$digest();
            }));

            it('der Loader wird nicht angezeigt', function () {
                var result = element.find('i');

                expect(result.length).to.be.equal(0);
            });
        });
    });
}());
