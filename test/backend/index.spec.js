var expect = require('chai').expect;
var request = require("supertest");
var server = require('./testserver.js')();

describe('Route: Index', function () {
    it('soll die index.html rendern', function (done) {
        request(server)
            .get('/')
            .expect(200)
            .set('Accept', 'text/html')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response.text).to.contain('<html');
                expect(response.text).to.contain('<body');
                expect(response.text).to.contain('</body>');
                expect(response.text).to.contain('</html>');
                return done();
            });
    });
});

