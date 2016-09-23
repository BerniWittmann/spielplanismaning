module.exports = {
    /**
     * @apiDefine ErrorMaxZahlGruppe
     *
     * @apiError (MaxZahlGruppe) {String} MESSAGE Error-Message: 'Maximalzahl an Gruppen für diese Jugend erreicht'
     * @apiError (MaxZahlGruppe) {Integer} STATUSCODE Status-Code: 418
     * @apiError (MaxZahlGruppe) {String} MESSAGEKEY Key der Message: 'ERROR_GROUP_MAX_AMOUNT'
     *
     * @apiErrorExample Error-Response MaxZahlGruppe:
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