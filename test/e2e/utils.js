module.exports = function () {
    return {
        getBaseURI: function () {
            return process.env.TEST_BASE_URI;
        },
        getPageHeaderText: function () {
            return element(by.css('.page-header h3')).getText();
        }
    };
};