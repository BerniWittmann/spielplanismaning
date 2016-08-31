(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Footer', function () {
        beforeEach(module('spi.footer.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var controller;
        var $httpBackend;
        var env = 'TESTING';

        beforeEach(inject(function ($rootScope, $compile, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();

            $httpBackend.expectGET('/api/config/version').respond(201, '0.0.0');
            $httpBackend.expectGET('/api/config/env').respond(201, env);
            element = $compile('<spi-footer></spi-footer>')(scope);
            scope.$digest();
            controller = element.controller("spiFooter");
            $httpBackend.flush();
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('soll der Link zur Kontaktseite erscheinen', function () {
            var link = undefined;
            _.forEach(element.find('a'), function (a) {
                a = angular.element(a);
                if (_.isEqual(a.attr('data-ui-sref'), 'spi.kontakt')) {
                    link = a;
                }
            });

            expect(link).not.to.be.undefined;
            expect(link).not.to.be.empty;
            expect(link.attr('data-ui-sref')).to.be.equal('spi.kontakt');
        });

        describe('Auf der Testumgebung', function () {
            before(function () {
                env = 'TESTING';
            });

            it('soll der Buildstatus gezeigt werden', function () {
                var result = element.find('img');

                expect(controller.showBuildStatus).to.be.true;
                expect(result).not.to.be.undefined;
                expect(result).not.to.be.empty;
                expect(result.length).to.be.above(0);
            });
        });

        describe('Auf der Produktionsumgebung', function () {
            before(function () {
                env = 'PROD';
            });

            it('soll der Buildstatus nicht gezeigt werden', function () {
                var result = element.find('img');

                expect(controller.showBuildStatus).to.be.false;
                expect(result).to.be.empty;
                expect(result.length).to.be.equal(0);
            });
        });
    });
}());
