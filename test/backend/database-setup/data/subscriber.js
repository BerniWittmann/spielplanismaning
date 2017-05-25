const ids = require('./ids');

const data = [{
    _id: ids.subscribers[0],
    email: 'my@mail.com',
    team: ids.teams[0],
    veranstaltung: ids.veranstaltung
}, {
    _id: ids.subscribers[0],
    email: 'test@byom.com',
    team: ids.teams[1],
    veranstaltung: ids.veranstaltung
}];

module.exports = {
    data: data
};