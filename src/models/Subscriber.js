const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriberSchema = new mongoose.Schema({
    email: String,
    team: {
        type: Schema.ObjectId,
        ref: 'Team'
    }
});

const deepPopulate = require('mongoose-deep-populate')(mongoose);
SubscriberSchema.plugin(deepPopulate, {});

SubscriberSchema.statics.getByTeam = function search(teamid, cb) {
    //noinspection JSUnresolvedFunction
    return this.find({
        'team': teamid
    }).exec(cb);
};

SubscriberSchema.methods.fill = function (cb) {
    const self = this;
    if (self.team && self.team._id) {
        return self.team.fill(function (err, team) {
            if (err) return cb(err);

            self.team = team;
            return cb(null, self);
        });
    }
    return cb(null, self);
};

mongoose.model('Subscriber', SubscriberSchema);