module.exports = function (err) {
    /**
     * @apiDefine ErrorTeamNotFoundMessage
     *
     * @apiError (TeamNotFound) {String} MESSAGE Error-Message: 'Error'
     * @apiError (TeamNotFound) {Integer} STATUSCODE Status-Code: 404
     * @apiError (TeamNotFound) {String} MESSAGEKEY Key der Message: 'ERROR_TEAM_NOT_FOUND'
     * @apiError (TeamNotFound) {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response TeamNotFound:
     *     HTTP/1.1 404 INTERNAL SERVER ERROR
     *     {
     *          "MESSAGE": "Team nicht gefunden",
     *          "STATUSCODE": 404,
     *          "MESSAGEKEY": "ERROR_TEAM_NOT_FOUND",
     *          "ERROR": [ Object ]
     *     }
     */
    return {
        MESSAGE: 'Team nicht gefunden',
        STATUSCODE: 404,
        MESSAGEKEY: 'ERROR_TEAM_NOT_FOUND',
        ERROR: err
    };
};