const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new mongoose.Schema({
    name: String,
    gruppe: {
        type: Schema.ObjectId,
        ref: 'Gruppe'
    },
    jugend: {
        type: Schema.ObjectId,
        ref: 'Jugend'
    },
    tore: {
        type: Number,
        default: 0
    },
    gtore: {
        type: Number,
        default: 0
    },
    punkte: {
        type: Number,
        default: 0
    },
    gpunkte: {
        type: Number,
        default: 0
    },
    from: {
        type: Schema.ObjectId,
        refPath: 'fromType'
    },
    fromType: String,
    rank: Number,
    isPlaceholder: {
        type: Boolean,
        default: false
    }
});

TeamSchema.methods.setErgebnis = function (tore, toreAlt, gTore, gToreAlt, punkte, punkteAlt, gPunkte, gPunkteAlt, cb) {
    this.tore = this.tore + tore - toreAlt;
    this.gtore = this.gtore + gTore - gToreAlt;
    this.punkte = this.punkte + punkte - punkteAlt;
    this.gpunkte = this.gpunkte + gPunkte - gPunkteAlt;
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

TeamSchema.methods.resetErgebnis = function (cb) {
    this.tore = 0;
    this.gtore = 0;
    this.punkte = 0;
    this.gpunkte = 0;
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

TeamSchema.methods.changeName = function (name, cb) {
    //noinspection JSUnresolvedVariable
    this.name = name;
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
TeamSchema.plugin(deepPopulate, {});

mongoose.model('Team', TeamSchema);