var expect = require('chai').expect;
var mongoose = require('mongoose');
var env = {};
const _ = require('lodash');
var server = require('../testserver.js')(env);
var request = require('supertest');
const constants = require('../../../src/config/constants');
const cls = require('../../../src/config/cls');

describe('Beach Event Middleware', function () {

    var eventID;
    var falscheEventID = mongoose.Types.ObjectId();
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;

            eventID = server.eventID;
            return done();
        });
    });

    describe('EventID soll für gewisse Routen benötigt werden', function () {
        _.forEach(constants.EVENT_REQUIRED_ROUTES, function (route) {
            if (_.includes(constants.EVENT_EXCLUDED_ROUTES, route)) return;
            it('Soll für Route ' + route + ' einen Fehler liefern, wenn keine BeachEventID gegeben ist', function (done) {
                request(server)
                    .get(route)
                    .end(function (err, response) {
                        if (err) return done(err);
                        expect(response).not.to.be.undefined;
                        expect(response.statusCode).to.equal(400);
                        expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                        expect(response.body.REASON).to.equal('No valid BEACH-EVENT-ID was set.');
                        return done();
                    });
            });

            it('Soll für Route ' + route + ' einen Fehler liefern, wenn eine falsche BeachEventID gegeben ist', function (done) {
                request(server)
                    .get(route)
                    .set(constants.BEACH_EVENT_HEADER_NAME, falscheEventID)
                    .end(function (err, response) {
                        if (err) return done(err);
                        expect(response).not.to.be.undefined;
                        expect(response.statusCode).to.equal(400);
                        expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                        expect(response.body.REASON).to.equal('No valid BEACH-EVENT-ID was set.');
                        return done();
                    });
            });

            it('soll keinen Fehler liefern wenn die BeachEventID übergeben wird', function (done) {
                request(server)
                    .get(route)
                    .set(constants.BEACH_EVENT_HEADER_NAME, eventID)
                    .end(function (err, response) {
                        if (err) return done(err);
                        expect(response).not.to.be.undefined;
                        expect(response.statusCode).to.not.equal(400);
                        expect(response.body.MESSAGEKEY).to.not.equal('ERROR_BAD_REQUEST');
                        expect(response.body.REASON).to.not.equal('No valid BEACH-EVENT-ID was set.');
                        return done();
                    });
            });
        });

    });

    after(function (done) {
        server.disconnectDB(done);
    });
});

