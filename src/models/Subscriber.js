const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const helper = require('./helper.js');
const cls = require('../config/cls.js');

let SubscriberSchema = new mongoose.Schema({
    email: String,
    team: {
        type: Schema.ObjectId,
        ref: 'Team'
    },
    veranstaltung: {type: Schema.ObjectId, ref: 'Veranstaltung', required: true}
});

const deepPopulate = require('../config/mongoose-deep-populate')(mongoose);
SubscriberSchema.plugin(deepPopulate, {});

SubscriberSchema.statics.getByTeam = function search(teamid, cb) {
    //noinspection JSUnresolvedFunction
    return this.find({
        'team': teamid
    }).exec(cb);
};

SubscriberSchema.methods.fill = function (cb) {
    const self = this;
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        if (self.team && self.team._id) {
            return self.team.fill(function (err, team) {
                if (err) return cb(err);

                self.team = team;
                return cb(null, self);
            });
        }
        return cb(null, self);
    });
};

SubscriberSchema = helper.applyBeachEventMiddleware(SubscriberSchema);

mongoose.model('Subscriber', SubscriberSchema);