(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: ErrorHandler', function () {
        beforeEach(module('spi.errorHandler'));

        var errorHandler;
        var mockState = {
            go: function () {}
        };
        var mockToastr = {
            error: function () {},
            warning: function () {}
        };

        var error = {
            MESSAGE: 'This is a error message',
            MESSAGE_KEY: 'And this is it\'s key'
        };

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('$state', mockState);
                $provide.value('toastr', mockToastr);
            });
        });

        beforeEach(inject(function (_errorHandler_) {
            errorHandler = _errorHandler_;
        }));

        it('soll eine Notification anzeigen', function () {
            var spy_toastr = chai.spy.on(mockToastr, 'error');

            errorHandler.handleResponseError(error);

            expect(spy_toastr).to.have.been.called.with(error.MESSAGE);
        });

        it('soll eine Internet-Verbindung-Fehlermeldung anzeigen', function () {
            var spy_toastr = chai.spy.on(mockToastr, 'warning');

            errorHandler.handleResponseError(undefined);

            expect(spy_toastr).to.have.been.called.with('Bitte prüfen Sie ihre Internet-Verbindung', 'Keine Internet-Verbindung');
        });
    });
}());