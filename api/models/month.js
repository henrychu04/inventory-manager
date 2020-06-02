const mongoose = require('mongoose');

const month_schema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    month: Number,
    expense: mongoose.Schema.Types.ObjectId,
    deposit: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('Month', month_schema, 'month');