'use strict';
module.exports = function () {
    return {
        klickeNavElement: function (name) {
            element(by.id('nav-button-' + name)).element(by.tagName('a')).click();
        },
        isNavDropdownVisible: function (name) {
            return element(by.id('nav-button-' + name)).element(by.tagName('ul')).isDisplayed();
        }
    };
};