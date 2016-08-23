(function () {
    'use strict';

    var expect = chai.expect;

    var uibModalInstance = {
        close: function () {
        }, dismiss: function () {
        }
    };

    describe('Component: Bestätigen-Modal', function () {
        beforeEach(module('spi.bestaetigen-modal.ui'));
        beforeEach(module('htmlModule'));
        var scope;
        var controller;

        beforeEach(inject(function ($rootScope, BestaetigenDialog, $controller) {
            scope = $rootScope.$new();

            var message = 'Test Nachricht';
            var fnct = function () {
                return 'Test Return Wert';
            };

            BestaetigenDialog.open(message, fnct);
            scope.$digest();
            controller = $controller('BestaetigenController', {
                $scope: scope,
                $uibModalInstance: uibModalInstance,
                message: message,
                fction: fnct,
                parameters: undefined
            });
        }));

        it('soll das Modal die übergebene Nachricht zeigen', function () {
            var result = controller.message;

            expect(result).to.be.equal('Test Nachricht');
        });

        it('das Modal soll geschlossen, werden können', function () {
            var spy_dismiss = chai.spy.on(uibModalInstance, 'dismiss');
            expect(spy_dismiss).not.to.have.been.called();

            controller.abbrechen();

            expect(spy_dismiss).to.have.been.called();
        });

        it('beim Bestätigen soll das Modal geschlossen werden', function () {
            var spy_close = chai.spy.on(uibModalInstance, 'close');
            expect(spy_close).not.to.have.been.called();

            controller.save();

            expect(spy_close).to.have.been.called();
        });

        it('beim Bestätigen, soll die Funktion ausgeführt werden', function () {
            var result = controller.save();

            expect(result).to.be.equal('Test Return Wert');
        });
    });
}());
