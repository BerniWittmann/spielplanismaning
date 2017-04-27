(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Team', function () {
        beforeEach(module('spi.team'));
        var ENDPOINT_BASE_URL = '/api/teams';

        var httpBackend;
        var team;
        var response;
        var responseTest;
        var mockTeams = [{
            name: 'Team 1',
            _id: '1',
            jugend: '123',
            gruppe: '1234'
        }, {
            name: 'Team 2',
            _id: '2',
            jugend: '123',
            gruppe: '1234'
        }, {
            name: 'Team 3',
            _id: '3',
            jugend: '312',
            gruppe: '3210'
        }, {
            name: 'Team 4',
            _id: '4',
            jugend: '321',
            gruppe: '4321'
        }];

        var mockErrorHandler = {
            handleResponseError: function () {}
        };

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('errorHandler', mockErrorHandler);
            });
        });

        beforeEach(inject(function (_team_, $httpBackend) {
            team = _team_;
            httpBackend = $httpBackend;
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

        it('soll alle Teams laden', function () {
            response = mockTeams;
            httpBackend.expectGET(ENDPOINT_BASE_URL).respond(201, response);

            team.getAll().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll ein Team erstellen', function () {
            response = mockTeams[0];
            httpBackend.expectPOST(ENDPOINT_BASE_URL + '?jugend=123&gruppe=1234', mockTeams[0]).respond(201, response);

            team.create(response).then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll ein bestimmtes Team laden', function () {
            response = mockTeams[0];
            httpBackend.expectGET(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            team.get('1').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll alle Spiele nach Gruppe laden', function () {
            response = [mockTeams[0], mockTeams[1]];
            httpBackend.expectGET(ENDPOINT_BASE_URL + '?gruppe=1234').respond(201, response);

            team.getByGruppe('1234').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
                expect(res).to.have.lengthOf(2);
            });
        });

        it('soll ein Team löschen können', function () {
            response = 'Team gelöscht';
            httpBackend.expectDELETE(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            team.delete('1').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll den Namen eines Teams ändern können', function () {
            response = mockTeams[0];
            var neuesTeam = response;
            neuesTeam.name = 'Neuer Name';
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '?id=1', neuesTeam).respond(201, response);

            team.updateName(response, 'Neuer Name').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });
    });
}());