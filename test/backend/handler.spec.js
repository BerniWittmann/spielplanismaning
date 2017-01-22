var expect = require('chai').expect;
var _ = require('lodash');
var handler = require('../../src/routes/handler.js');
var messages = require('../../src/routes/messages/messages.js')();

describe('Handlers', function () {
    var res = {
        json: function (data) {
            res.data = data;
        },
        status: function (statusCode) {
            res.statusCode = statusCode;
            return {
                json: res.json
            }
        },
        data: undefined,
        statusCode: undefined
    };

    beforeEach(function () {
        res.data = undefined;
        res.statusCode = undefined;
    });

    describe('handle Error and send Response', function () {
        it('soll den Error handlen', function () {
            var err = {errorCode: 0, name: 'Error'};

            handler.handleErrorAndResponse(err, res, {});

            expect(res.data.MESSAGEKEY).to.equal('ERROR');
            expect(res.data.ERROR).to.deep.equal(err);
            expect(res.statusCode).to.equal(500);
        });

        it('soll die Response senden', function () {
            var data = {data: 'test', id: 1234};

            handler.handleErrorAndResponse(null, res, data);

            expect(res.data).to.equal(data);
            expect(res.statusCode).to.equal(200);
        });
    });

    describe('handle Error and send Message', function () {
        it('soll den Error handlen', function () {
            var err = {errorCode: 0, name: 'Error'};

            handler.handleErrorAndMessage(err, res, function () {
            });

            expect(res.data.MESSAGEKEY).to.equal('ERROR');
            expect(res.data.ERROR).to.deep.equal(err);
            expect(res.statusCode).to.equal(500);
        });

        it('soll die Nachricht senden', function () {
            handler.handleErrorAndMessage(null, res, messages.ErrorGruppeNotFound);

            expect(res.data.MESSAGEKEY).to.equal('ERROR_GROUP_NOT_FOUND');
            expect(res.statusCode).to.equal(404);
        });
    });

    describe('handle Error and send Success-Message', function () {
        it('soll den Error handlen', function () {
            var err = {errorCode: 0, name: 'Error'};

            handler.handleErrorAndSuccess(err, res);

            expect(res.data.MESSAGEKEY).to.equal('ERROR');
            expect(res.data.ERROR).to.deep.equal(err);
            expect(res.statusCode).to.equal(500);
        });

        it('soll die Nachricht senden', function () {
            handler.handleErrorAndSuccess(null, res);

            expect(res.data.MESSAGEKEY).to.equal('SUCCESS_MESSAGE');
            expect(res.statusCode).to.equal(200);
        });
    });

    describe('handle Error and send Deleted-Message', function () {
        it('soll den Error handlen', function () {
            var err = {errorCode: 0, name: 'Error'};

            handler.handleErrorAndDeleted(err, res);

            expect(res.data.MESSAGEKEY).to.equal('ERROR');
            expect(res.data.ERROR).to.deep.equal(err);
            expect(res.statusCode).to.equal(500);
        });

        it('soll die Nachricht senden', function () {
            handler.handleErrorAndDeleted(null, res);

            expect(res.data.MESSAGEKEY).to.equal('SUCCESS_DELETE_MESSAGE');
            expect(res.statusCode).to.equal(200);
        });
    });

    describe('handle Query Response', function () {
        it('soll nicht gefundene Entitites handlen', function () {
            handler.handleQueryResponse(null, null, res, true, messages.ErrorGruppeNotFound);

            expect(res.data.MESSAGEKEY).to.equal('ERROR_GROUP_NOT_FOUND');
            expect(res.statusCode).to.equal(404);
        });

        it('soll den Error handlen', function () {
            var err = {errorCode: 0, name: 'Error'};

            handler.handleQueryResponse(err, {}, res, false, function () {});

            expect(res.data.MESSAGEKEY).to.equal('ERROR');
            expect(res.data.ERROR).to.deep.equal(err);
            expect(res.statusCode).to.equal(500);
        });

        it('soll die Response senden', function () {
            var data = {data: '1234', id: 1234};

            handler.handleQueryResponse(null, data, res, true, function () {});

            expect(res.data).to.deep.equal(data);
            expect(res.statusCode).to.equal(200);
        });
    });
});

