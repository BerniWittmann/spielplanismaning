(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Email', function () {
        beforeEach(module('ui.router'));
        beforeEach(module('spi.email'));
        beforeEach(module('spi.constants'));
        var ENDPOINT_BASE_URL = '/api/email';
        var TOKENNAME = 'spielplan-ismaning-subscriptions';

        var httpBackend;
        var email;
        var window;
        var response;
        var responseTest;
        var array = [{
            email: 'Test',
            team: '123'
        }, {
            email: 'Test-Team 2',
            team: '123'
        }, {
            email: 'abc',
            team: '321'
        }];
        beforeEach(inject(function (_email_, $httpBackend, $window) {
            email = _email_;
            httpBackend = $httpBackend;
            window = $window;
            response = undefined;
        }));

        afterEach(function () {
            if (!_.isUndefined(response)) {
                httpBackend.flush();
                httpBackend.verifyNoOutstandingExpectation();
                httpBackend.verifyNoOutstandingRequest();
                expect(_.isEqual(responseTest, response)).to.be.true;
            }
        });

        it('soll eine Email senden können', function () {
            var mail = {
                test: 'Test',
                email: 'Test@t.de',
                nachricht: 'Juhuu'
            };
            response = 'Email sent';
            httpBackend.expectPOST(ENDPOINT_BASE_URL, mail).respond(201, response);

            email.send(mail).then(function (res) {
                responseTest = res;
                expect(res).to.be.equal(response);
            });
        });

        it('soll einen Abonennten hinzufügen können', function () {
            var abonnent = {
                email: 'Test@web.de',
                team: '1244bfij14'
            };
            var spy = chai.spy.on(email, 'addSubscriptionToken');
            response = 'Abonnement hinzugefügt';
            httpBackend.expectPOST(ENDPOINT_BASE_URL + '/subscriber', abonnent).respond(201, response);

            email.addSubscriber(abonnent).then(function (res) {
                responseTest = res;
                expect(res).to.be.equal(response);
                expect(spy).to.have.been.called();
            });
        });

        it('soll einen Abonennten hinzufügen können', function () {
            var abonnent = {
                email: 'Test@web.de',
                team: '1244bfij14'
            };
            var spy = chai.spy.on(email, 'addSubscriptionToken');
            response = 'Abonnement hinzugefügt';
            httpBackend.expectPOST(ENDPOINT_BASE_URL + '/subscriber', abonnent).respond(201, response);

            email.addSubscriber(abonnent).then(function (res) {
                responseTest = res;
                expect(res).to.be.equal(response);
                expect(spy).to.have.been.called();
            });
        });

        it('soll ein Token gespeichert werden', function () {
            email.checkSubscription = function () {
                return false;
            };
            window.localStorage.removeItem(TOKENNAME);
            var abonnent = {
                email: 'Test@web.de',
                team: '1244bfij14'
            };

            email.addSubscriptionToken(abonnent);

            var result = JSON.parse(window.localStorage[TOKENNAME])[0];
            expect(result.email).to.be.equal(abonnent.email);
            expect(result.team).to.be.equal(abonnent.team);
        });

        it('soll die Abonnenten laden', function () {
            response = [{email: 'Test', team: '123'}, {email: 'abc', team: '321'}];
            httpBackend.expectGET(ENDPOINT_BASE_URL + '/subscriber').respond(201, response);

            email.getSubscribers().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll die Abonnenten nach Teams gefiltert laden', function () {
            window.localStorage[TOKENNAME] = JSON.stringify(array);

            var result = email.getSubscriptionByTeam({team: '123'});

            expect(result).to.have.lengthOf(2);
            expect(_.isEqual(result[0], array[0])).to.be.true;
            expect(_.isEqual(result[1], array[1])).to.be.true;
        });

        it('soll die Email des ersten Abonnenten nach Teams gefiltert laden', function () {
            window.localStorage[TOKENNAME] = JSON.stringify(array);

            var result = email.getEmailSubscriptionByTeam('123');

            expect(result).to.equal('Test');
        });

        it('soll geprüft werden können ob das Team bereits abonniert ist', function () {
            window.localStorage[TOKENNAME] = JSON.stringify(array);
            var abonnent1 = {email: 'Test', team: '123'};
            var abonnent2 = {email: 'Test2', team: '123'};

            var result1 = email.checkSubscription(abonnent1);
            var result2 = email.checkSubscription(abonnent2);

            expect(result1).to.be.true;
            expect(result2).to.be.false;
        });

        it('soll ein Abonnement gelöscht werden können', function () {
            response = 'Abonnement gelöscht';
            httpBackend.expectDELETE(ENDPOINT_BASE_URL + '/subscriber?email=Test&team=123').respond(201, response);

            email.removeSubscription(array[0]).then(function (res) {
                responseTest = res;

                var result = JSON.parse(window.localStorage[TOKENNAME]);

                expect(_.isEqual(res, response)).to.be.true;
                expect(result).to.have.lengthOf(2);
                expect(_.isEqual(result[0], array[1])).to.be.true;
                expect(_.isEqual(result[1], array[2])).to.be.true;
            });
        });
    });

}());