const cls = require('continuation-local-storage');
cls.createNamespace('cls-session');

module.exports = {
    getNamespace: function () {
        return cls.getNamespace('cls-session');
    },
    getBeachEventID: function () {
        return cls.getNamespace('cls-session').get('beachEventID');
    },
    setBeachEventID: function (val) {
        return cls.getNamespace('cls-session').set('beachEventID', val);
    }
};