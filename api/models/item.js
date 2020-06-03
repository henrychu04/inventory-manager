const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    expense: Number,
    deposit: Number,
    date: Date,
    type: String,
    sale: { type: Boolean, default: false }
});

module.exports = mongoose.model('Item', itemSchema, 'items');