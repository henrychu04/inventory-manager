const mongoose = require('mongoose');

const item_schema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    expense: Number,
    deposit: Number,
    date: Date,
    type: String
});

module.exports = mongoose.model('Item', item_schema, 'items');