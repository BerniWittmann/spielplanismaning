(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Logger', function () {
        beforeEach(module('spi.logger'));
        var scope;
        var Logger;

        beforeEach(inject(function ($rootScope, _Logger_) {
            scope = $rootScope.$new();

            Logger = _Logger_;

            //Overwrite console.log to prevent Logs
            console.log = function () {
            };
        }));

        describe('Das Logging ist aktiviert', function () {
            beforeEach(function () {
                Logger.enableLogging();
            });

            it('Wird der Text inkl. Prefix ausgegeben', function () {
                var spy = chai.spy.on(console, 'log');

                Logger.log('Test');

                expect(spy).to.have.been.called.with('Spielplan-Ismaning Log: Test');
            });
        });

        describe('Das Logging ist deaktiviert', function () {
            beforeEach(function () {
                Logger.disableLogging();
            });

            it('Wird der Text nicht ausgegeben', function () {
                var spy = chai.spy.on(console, 'log');

                Logger.log('Test');

                expect(spy).to.not.have.been.called.with('Spielplan-Ismaning Log: Test');
            });
        });
    });
}());
