module.exports = {
    /**
     * @apiDefine ErrorMaxZahlGruppe
     *
     * @apiError MaxZahlGruppe Maximalzahl an Gruppen für die gewählte Jugend erreicht.
     *
     * @apiError {String} MESSAGE Error-Messge: 'Maximalzahl an Gruppen für diese Jugend erreicht'
     * @apiError {Integer} STATUSCODE Status-Code: 418
     * @apiError {String} MESSAGEKEY Key der Message: 'ERROR_GROUP_MAX_AMOUNT'
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 418 I'm a teapot
     *     {
     *          "MESSAGE": "Maximalzahl an Gruppen für diese Jugend erreicht",
     *          "STATUSCODE": 418,
     *          "MESSAGEKEY": "ERROR_GROUP_MAX_AMOUNT"
     *     }
     */
    MESSAGE: 'Maximalzahl an Gruppen für diese Jugend erreicht',
    STATUSCODE: 418,
    MESSAGEKEY: 'ERROR_GROUP_MAX_AMOUNT'
};