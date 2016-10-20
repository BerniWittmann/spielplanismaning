(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Footer', function () {
        beforeEach(module('spi.footer.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var controller;
        var env = 'testing';
        var $provide;

        beforeEach(module(function (_$provide_) {
            $provide = _$provide_;
        }));

        beforeEach(inject(function ($rootScope, $compile, $q) {
            scope = $rootScope.$new();

            $provide.service('config', function () {
                return {
                    getEnv: function () {
                        var deferred = $q.defer();
                        deferred.resolve({data: env});
                        return deferred.promise;
                    }
                };
            });
            element = $compile('<spi-footer></spi-footer>')(scope);
            scope.$digest();
            controller = element.controller("spiFooter");
        }));

        it('soll der Link zur Kontaktseite erscheinen', function () {
            var link = undefined;
            _.forEach(element.find('a'), function (a) {
                a = angular.element(a);
                if (_.isEqual(a.attr('data-ui-sref'), 'spi.kontakt')) {
                    link = a;
                }
            });

            expect(link).not.to.be.undefined;
            expect(link).to.exist;
            expect(link.attr('data-ui-sref')).to.be.equal('spi.kontakt');
        });

        describe('Auf der Testumgebung', function () {
            before(function () {
                env = 'testing';
                scope.$digest();
            });

            it('soll der Buildstatus gezeigt werden', function () {
                var result = element.find('img');
                expect(controller.showBuildStatus).to.be.true;
                expect(result).not.to.be.undefined;
                expect(result).to.exist;
                expect(result.length).to.be.above(0);
            });
        });

        describe('Auf der Produktionsumgebung', function () {
            before(function () {
                env = 'production';
                scope.$digest();
            });

            it('soll der Buildstatus nicht gezeigt werden', function () {
                var result = element.find('img');
                expect(controller.showBuildStatus).to.be.false;
                expect(result).not.to.exist;

                expect(result.length).to.be.equal(0);
            });
        });
    });
}());
