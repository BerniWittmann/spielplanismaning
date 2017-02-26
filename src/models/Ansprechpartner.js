const mongoose = require('mongoose');

const AnsprechpartnerSchema = new mongoose.Schema({
    name: String,
    turnier: String,
    email: String
});

const deepPopulate = require('mongoose-deep-populate')(mongoose);
AnsprechpartnerSchema.plugin(deepPopulate, {});

mongoose.model('Ansprechpartner', AnsprechpartnerSchema);