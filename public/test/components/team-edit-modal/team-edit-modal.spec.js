(function () {
    'use strict';

    var expect = chai.expect;

    var uibModalInstance = {
        close: function () {
        }, dismiss: function () {
        }
    };

    var gewaehltesTeam;
    var mockTeam;

    describe('Component: Team-Edit-Modal', function () {
        beforeEach(module('spi.verwaltung.team-edit-modal.ui'));
        beforeEach(module('htmlModule'));
        var scope;
        var controller;

        beforeEach(inject(function ($rootScope, $controller, $q) {
            scope = $rootScope.$new();

            gewaehltesTeam = {
                _id: '1',
                name: 'Test Team 1'
            };

            mockTeam = {
                updateName: function () {
                    return $q.when();
                }
            };

            controller = $controller('TeamEditierenController', {
                $uibModalInstance: uibModalInstance,
                gewTeam: gewaehltesTeam,
                team: mockTeam
            });
        }));

        it('Es wird der Name des Teams geladen', function () {
            var result = controller.name;

            expect(result).to.be.equal('Test Team 1');
        });

        it('Der name des Teams kann geändert werden', function () {
            controller.name = 'Neuer Name';
            var spy = chai.spy.on(mockTeam, 'updateName');

            controller.save();

            expect(spy).to.have.been.called.with(gewaehltesTeam, 'Neuer Name');
        });

        it('test');
    });
}());
