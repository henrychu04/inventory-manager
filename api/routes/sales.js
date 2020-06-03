const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Sale = require('../models/sale');

router.get('/', (req, res, next) => {
    Sale.find()
        .select('-__v')
        .then(docs => {
            const response = {
                count: docs.length,
                sales: docs
            }

            res.status(200).send(response);
        })
        .catch(err => res.status(500).send({ err: err }));
});

router.post('/', (req, res, next) => {
    const sale = new Sale({
        _id: new mongoose.Types.ObjectId(),
        itemId: req.body.itemId,
        dateBought: req.body.dateBought,
        dateSold: req.body.dateSold,
        price: req.body.price,
        revenue: req.body.revenue,
        profit: req.body.profit,
        marketplace: req.body.marketplace
    });

    sale
        .save()
        .then(
            res.status(201).send({ 
                message: 'Sale saved',
                saleAdded: sale,
                request: {
                    type: 'GET',
                    description1: 'Get sale item',
                    url:  req.protocol + '://' + req.get('host') + '/items/' + sale.itemId,
                    description2: 'Get sale',
                    url: req.protocol + '://' + req.get('host') + '/sales/' + sale._id

                }
            })
        )
        .catch(err => res.status(500).send({ err: err }));
});

router.get('/:saleId', (req, res, next) => {
    const id = req.params.itemId;

    Sale.findById(id)
        .select('-__v')
        .then(doc => {
            if (doc) {
                res.status(200).send(doc);
            } else {
                res.status(404).send({ 
                    message: 'Sale not found',
                    request: {
                        type: 'GET',
                        description: 'List all sales',
                        url:  req.protocol + '://' + req.get('host') + req.originalUrl
                    }
                });
            }
        })
        .catch(err => res.status(500).send({ error: err }));
});

module.exports = router;