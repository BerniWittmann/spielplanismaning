(function () {
    'use strict';

    var expect = chai.expect;

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

            expect(test).to.be.undefined;
            expect(test2).not.to.be.undefined;
        });
    });
}());
