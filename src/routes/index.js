module.exports = function () {
    var express = require('express');
    var router = express.Router();

    /**
     * @api {get} / Render Page
     * @apiName RenderPage
     * @apiDescription Lädt die Seite
     * @apiGroup index
     *
     *
     * @apiSuccess {html} body HTML-Struktur der Seite
     **/
    router.get('/', function (req, res) {
        return res.render('index');
    });

    return router;
};