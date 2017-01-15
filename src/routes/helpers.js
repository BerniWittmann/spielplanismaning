var messages = require('./messages/messages.js')();

function getEntityQuery(model, req) {
    var query = model.find();
    var searchById = false;
    if (req.query.id) {
        searchById = true;
        query = model.findById(req.query.id);
    } else if (req.query.team) {
        //noinspection JSUnresolvedFunction
        query = model.find({}).or([{
            teamA: req.query.team
        }, {
            teamB: req.query.team
        }]);
    } else if (req.query.gruppe) {
        query = model.find({gruppe: req.query.gruppe});
    }
    else if (req.query.jugend) {
        query = model.find({jugend: req.query.jugend});
    }
    return {
        query: query,
        searchById: searchById
    }
}

function handleQueryResponse(err, data, res, searchById, notFoundError) {
    if(searchById && !data) {
        return notFoundError(res, err);
    }
    if (err) {
        return messages.Error(res, err);
    }

    return res.json(data);
}

module.exports = {
    getEntityQuery: getEntityQuery,
    handleQueryResponse: handleQueryResponse
};