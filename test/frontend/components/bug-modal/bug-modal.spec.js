(function () {
    'use strict';

    var expect = chai.expect;

    var uibModalInstance = {
        close: function () {
        }, dismiss: function () {
        }
    };

    var mockEmail;

    var role = 'Admin';
    var username = 'Username';
    var version = '0.0.0';
    var env = 'testing';

    describe('Component: Bug-Modal', function () {
        beforeEach(module('spi.components.bug-modal.ui'));
        beforeEach(module('htmlModule'));
        var scope;
        var controller;

        beforeEach(inject(function ($rootScope, $controller, $timeout, $q) {
            scope = $rootScope.$new();

            mockEmail = {
                sendBugReport: function (data) {
                    mockEmail.sentData = data;
                    return $q.when();
                },
                sentData: undefined
            };

            controller = $controller('BugMailController', {
                $uibModalInstance: uibModalInstance,
                $timeout: $timeout,
                email: mockEmail,
                version: version,
                env: env,
                username: username,
                role: role
            });

            scope.$apply();
        }));

        it('soll das Modal die Version laden', function () {
            var result = controller.mail.version;

            expect(result).to.be.equal('0.0.0');
        });

        it('soll das Modal die Environment laden', function () {
            var result = controller.mail.env;

            expect(result).to.be.equal('testing');
        });

        it('soll das Modal die Rolle laden', function () {
            var result = controller.mail.rolle;

            expect(result).to.be.equal('Admin');
        });

        it('soll das Modal den Usernamen laden', function () {
            var result = controller.mail.username;

            expect(result).to.be.equal('Username');
        });

        it('das Modal soll geschlossen, werden können', function () {
            var spy_dismiss = chai.spy.on(uibModalInstance, 'dismiss');
            expect(spy_dismiss).not.to.have.been.called();

            controller.abbrechen();

            expect(spy_dismiss).to.have.been.called();
        });

        it('beim Bestätigen soll das Modal geschlossen werden', inject(function ($timeout) {
            var spy_close = chai.spy.on(uibModalInstance, 'close');
            expect(spy_close).not.to.have.been.called();

            controller.send();
            scope.$apply();
            $timeout.flush();

            expect(spy_close).to.have.been.called();
        }));

        it('beim Bestätigen, soll der Bug-Report gesendet werden', function () {
            controller.mail.text = 'Text';
            controller.mail.title = 'Title';
            controller.mail.vorname = 'Vorname';
            controller.mail.nachname = 'Nachname';
            controller.mail.email = 'test@byom.de';
            var spy_send = chai.spy.on(mockEmail, 'sendBugReport');

            controller.send();

            expect(spy_send).to.have.been.called();
            var datetime = mockEmail.sentData.datetime;
            expect(datetime).not.to.be.undefined;
            expect(mockEmail.sentData).to.deep.equal({
                name: 'Vorname Nachname',
                vorname: 'Vorname',
                nachname: 'Nachname',
                text: 'Text',
                title: 'Title',
                env: env,
                version: version,
                rolle: role,
                username: username,
                email: 'test@byom.de',
                datetime: datetime
            });
        });

        it('beim Senden soll eine Nachricht angezeigt werden', function () {
            controller.mail.text = 'Text';
            controller.mail.title = 'Title';
            controller.mail.vorname = 'Vorname';
            controller.mail.nachname = 'Nachname';
            controller.mail.email = 'test@byom.de';

            controller.send();

            expect(controller.sent).to.be.true;
        });
    });
}());
