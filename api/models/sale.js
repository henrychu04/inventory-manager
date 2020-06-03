const mongoose = require('mongoose');

const saleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    dateBought: Date,
    dateSold: Date,
    price: Number,
    revenue: Number,
    profit: Number,
    marketplace: String
});

module.exports = mongoose.model('Sale', saleSchema, 'sales');