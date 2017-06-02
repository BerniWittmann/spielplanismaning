(function () {
    'use strict';

    var expect = chai.expect;

    var uibModalInstance = {
        close: function () {
        }, dismiss: function () {
        }
    };

    var mockState = {
        go: function () {
        }
    };

    var mockEmail;
    var cont;
    var gewaehltesTeam;

    describe('Component: Team-Abonnieren-Modal', function () {
        beforeEach(module('spi.components.team-abonnieren-modal.ui'));
        beforeEach(module('htmlModule'));
        var scope;
        var controller;

        beforeEach(inject(function ($rootScope, $controller, $q) {
            scope = $rootScope.$new();
            scope.spielplanEnabled = true;

            gewaehltesTeam = {
                _id: '1',
                name: 'Test Team 1'
            };

            mockEmail = {
                alreadyRegistered: false,
                checkSubscription: function () {
                    return mockEmail.alreadyRegistered;
                },
                getSubscriptionByTeam: function () {
                    return [{team: '1', email: 'test@test.de'}];
                },
                getEmailSubscriptionByTeam: function () {
                    return 'test@test.de';
                },
                addSubscriber: function () {
                    return $q.when();
                }
            };

            cont = $controller;
            compile();
        }));

        function compile() {
            controller = cont('TeamAbonnierenController', {
                $state: mockState,
                $uibModalInstance: uibModalInstance,
                gewTeam: gewaehltesTeam,
                email: mockEmail,
                $rootScope: scope
            });
        }

        describe('Wenn der Nutzer das Team bereits abonniert hat', function () {
            beforeEach(function () {
                mockEmail.alreadyRegistered = true;
                compile();
            });

            it('Die Email wird geladen', function () {
                var result = controller.abonnent.email;

                expect(result).to.be.equal('test@test.de');
            });
        });

        it('Es kann eine Email-Adresse registriert werden', function () {
            controller.abonnent.email = 'neueEmail@test.de';
            var spy = chai.spy.on(mockEmail, 'addSubscriber');

            controller.addAbonnent({$valid: true, $setUntouched: function () {}});

            expect(spy).to.have.been.called.with({email: 'neueEmail@test.de', team: '1'});
        });
    });
}());
