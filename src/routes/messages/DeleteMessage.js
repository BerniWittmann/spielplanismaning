module.exports = {
    /**
     * @apiDefine SuccessDeleteMessage
     *
     * @apiSuccess {String} MESSAGE Success-Messge: 'Successfully Deleted'
     * @apiSuccess {Integer} STATUSCODE Status-Code: 200
     * @apiSuccess {String} MESSAGEKEY Key der Message: 'SUCCESS_DELETE_MESSAGE''
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *          "MESSAGE": "Successfully Deleted",
     *          "STATUSCODE": 200,
     *          "MESSAGEKEY": "SUCCESS_DELETE_MESSAGE"
     *     }
     */
    MESSAGE: 'Successfully Deleted',
    STATUSCODE: 200,
    MESSAGEKEY: 'SUCCESS_DELETE_MESSAGE'
};