module.exports = function (slugs) {
    return {
        MESSAGE: 'Slugs ' + (slugs ? slugs.join(', ') : '') +' wurden nicht gespeichert, da sie bereits existieren',
        STATUSCODE: 400,
        MESSAGEKEY: 'WARNING_NOT_ALL_SLUGS_SAVED'
    };
};