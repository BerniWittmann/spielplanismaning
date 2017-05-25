const ids = require('./ids');

const data = [{
    _id: ids.ansprechpartner[0],
    name: 'Test Name',
    email: 'my@mail.com',
    turnier: 'Mein Turnier'
}, {
    _id: ids.ansprechpartner[1],
    name: 'Ansprechpartner Name',
    email: 'test@byom.com',
    turnier: 'Mein anderes Turnier'
}];

module.exports = {
    data: data
};