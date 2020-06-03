const mongoose = require('mongoose');

const monthSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    month: Number,
    expense: {type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    deposit: {type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

module.exports = mongoose.model('Month', monthSchema, 'month');