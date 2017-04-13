var expect = require('chai').expect;
var request = require("supertest");
var server = require('./testserver.js')();

describe('Route: notFound', function () {
    var methods = ['GET', 'POST', 'PUT', 'DELETE'];
    function getRequestByMethod(method, route) {
        if (method === 'GET') {
            return request(server).get(route);
        } else if (method === 'POST') {
            return request(server).post(route);
        } else if (method === 'PUT') {
            return request(server).put(route);
        } else if (method === 'DELETE') {
            return request(server).delete(route);
        }
    }

    methods.forEach(function (method) {
       it('soll für eine ungültige ' + method + ' Route einen 404 liefern', function (done) {
           getRequestByMethod(method, '/api/invalid')
               .end(function (err, response) {
                   if (err) return done(err);
                   expect(response.status).to.equal(404);
                   expect(response.body.MESSAGE).to.equal('Nicht gefunden');
                   expect(response.body.MESSAGEKEY).to.equal('ERROR_NOT_FOUND');
                   return done();
               });
       });
    });
});

