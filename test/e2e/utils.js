module.exports = function () {
    return {
        getBaseURI: function () {
            return process.env.TEST_BASE_URI;
        },
        loadPage: function (browser) {
            return browser.get(this.getBaseURI(), 60000);
        },
        getPageHeaderText: function () {
            return element(by.css('.page-header h3')).getText();
        }
    };
};