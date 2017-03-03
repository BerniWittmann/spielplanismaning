(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Logger', function () {
        beforeEach(module('spi.logger'));
        beforeEach(module('spi.constants'));
        var scope;
        var Logger;

        beforeEach(inject(function ($rootScope, _Logger_) {
            scope = $rootScope.$new();

            Logger = _Logger_;

            //Overwrite console.log to prevent Logs
            console.log = function () {
            };
            console.error = function () {
            };
            console.warn = function () {
            };
            console.info = function () {
            };
        }));

        describe('Das Logging ist aktiviert', function () {
            beforeEach(function () {
                Logger.enableLogging();
            });

            describe('Wird der Text inkl. Prefix ausgegeben', function () {
                _.forEach(['Log', 'Warn', 'Error', 'Info'], function (method) {
                    it('Methode: ' + method, function () {
                        var spy = chai.spy.on(console, method.toLowerCase());

                        Logger[method.toLowerCase()]('Test');

                        expect(spy).to.have.been.called.with('Spielplan-Ismaning ' + method + ': Test');
                    })
                })
            });
        });

        describe('Das Logging ist deaktiviert', function () {
            beforeEach(function () {
                Logger.disableLogging();
            });

            describe('Wird der Text nicht ausgegeben', function () {
                _.forEach(['Log', 'Warn', 'Error', 'Info'], function (method) {
                    it('Methode: ' + method, function () {
                        var spy = chai.spy.on(console, method.toLowerCase());

                        Logger[method.toLowerCase()]('Test');

                        expect(spy).not.to.have.been.called.with('Spielplan-Ismaning ' + method + ': Test');
                    })
                })
            });
        });
    });
}());
