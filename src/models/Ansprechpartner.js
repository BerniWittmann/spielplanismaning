const mongoose = require('mongoose');

const AnsprechpartnerSchema = new mongoose.Schema({
    name: String,
    turnier: String,
    email: String
});

AnsprechpartnerSchema.methods.fill = function (cb) {
    return cb(null, this);
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
AnsprechpartnerSchema.plugin(deepPopulate, {});

mongoose.model('Ansprechpartner', AnsprechpartnerSchema);