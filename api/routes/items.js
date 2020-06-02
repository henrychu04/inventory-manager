const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Item = require('../models/item');

router.get('/', (req, res, next) => {
    Item.find()
        .select('-__v')
        .then(docs => {
            const response = {
                count: docs.length,
                items: docs
            }

            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({ err: err });
        });
});

router.post('/', (req, res, next) => {
    const item = new Item({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        expense: req.body.expense,
        deposit: req.body.deposit,
        date: new Date(req.body.date),
        type: req.body.type
    });

    item
        .save()
        .then(
            res.status(201).json({
                message: 'Item added successfully',
                item_added: item,
                request: {
                    type: 'GET',
                    description: 'Get updated item',
                    url:  req.protocol + '://' + req.get('host') + req.originalUrl + item._id
                }
            })
        )
        .catch(err => {
            res.status(500).json({
                err: err
            });  
        });

    Item.save();
});

router.get('/:item_id', (req, res, next) => {
    const id = req.params.item_id;

    Item.findById(id)
        .select('-__v')
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ 
                    message: 'No item found',
                    request: {
                        type: 'Get',
                        description: 'List all items',
                        url:  req.protocol + '://' + req.get('host') + req.originalUrl
                    }
                });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});

router.patch('/:item_id', (req, res, next) => {
    const id = req.params.item_id;
    const update_ops = [];

    for (const ops of req.body) {
        update_ops[ops.propName] = ops.value;
    }

    Item.update({ _id: id }, { $set: update_ops })
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Item edited successfully',
                request: {
                    type: 'GET',
                    description: 'Get updated item',
                    url:  req.protocol + '://' + req.get('host') + req.originalUrl + req.params.item_id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.delete('/:item_id', (req, res, next) => {
    const id = req.params.item_id;

    Item.remove({ _id: id })
        .then(result => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err: err });
        });
});

module.exports = router;