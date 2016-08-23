(function () {
    'use strict';

    var expect = chai.expect;
    var Assertion = chai.Assertion;

    Assertion.addMethod('spiUndefined', function () {
        var obj = this._obj;

        // first, our instanceof check, shortcut
        new Assertion(this._obj).to.be.a(undefined);

        // second, our type check
        this.assert(
            obj._type === type
            , "expected #{this} to be undefined"
            , "expected #{this} not to be undefined"
            , undefined        // expected
            , obj._type   // actual
        );
    });

    describe('Allgemeine Frontend Tests', function () {
        it('Spy für Methoden', function () {
            var array = [1, 2, 3];
            var spy = chai.spy.on(array, 'push');
            var spy2 = chai.spy.on(array, 'pop');

            array.push(5);

            expect(array.length).to.be.equal(4);
            expect(spy).to.have.been.called();
            expect(spy2).not.to.have.been.called();
        });

        it('Undefined Assertion', function () {
            var test = undefined;
            var test2 = 'Test';

            expect(test).to.be.spiUndefined();
            expect(test2).not.to.be.spiUndefined();
        });
    });
}());
