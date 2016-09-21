var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SpielPlanSchema = new mongoose.Schema({
    startzeit: String //10:40
    , spielzeit: Number
    , pausenzeit: Number
    , spiele: [
        {
            type: Schema.ObjectId
            , ref: 'Spiel'
        }
    ]
    , ausnahmen: [
        {
            team1: {
                type: Schema.ObjectId
                , ref: 'Team'
            }
            , team2: {
            type: Schema.ObjectId
            , ref: 'Team'
        }
        }
    ]
});

var deepPopulate = require('mongoose-deep-populate')(mongoose);
SpielPlanSchema.plugin(deepPopulate, {});

SpielPlanSchema.methods.setAusnahmen = function (ausnahmen, cb) {
    this.ausnahmen = ausnahmen;
    this.save(cb);
};

mongoose.model('Spielplan', SpielPlanSchema);