const async = require('async');

function fillOfEntity(entity, type, cb) {
    return async.eachOf(entity[type], function (t, index, next) {
        if (t && t._id) {
            return t.fill(function (err, team) {
                if (err) return cb(err);

                entity[type][index] = team;
                entity.set(type, entity[type]);
                return next();
            });
        }
    }, function (err) {
        if (err) return cb(err);

        return cb(null, entity);
    });
}

module.exports = {
    fillOfEntity: fillOfEntity
};