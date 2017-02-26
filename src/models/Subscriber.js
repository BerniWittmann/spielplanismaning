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

mongoose.model('Subscriber', SubscriberSchema);