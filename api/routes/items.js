const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Item = require('../models/item');

router.get('/', (req, res, next) => {
  Item.find()
    .select('-__v')
    .then((docs) => {
      const response = {
        count: docs.length,
        items: docs,
      };

      res.status(200).send(response);
    })
    .catch((err) => res.status(500).send({ err: err }));
});

router.post('/', (req, res, next) => {
  const item = new Item({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    expense: req.body.expense,
    deposit: req.body.deposit,
    date: new Date(req.body.date),
    type: req.body.type,
  });

  item
    .save()
    .then(
      res.status(201).send({
        message: 'Item added successfully',
        itemAdded: item,
        request: {
          type: 'GET',
          description: 'Get updated item',
          url:
            req.protocol + '://' + req.get('host') + req.originalUrl + item._id,
        },
      })
    )
    .catch((err) => res.status(500).send({ err: err }));
});

router.get('/:itemId', (req, res, next) => {
  const id = req.params.itemId;

  Item.findById(id)
    .select('-__v')
    .then((doc) => {
      if (doc) {
        res.status(200).send(doc);
      } else {
        res.status(404).send({
          message: 'Item not found',
          request: {
            type: 'GET',
            description: 'List all items',
            url: req.protocol + '://' + req.get('host') + req.originalUrl,
          },
        });
      }
    })
    .catch((err) => res.status(500).send({ error: err }));
});

router.patch('/:itemId', (req, res, next) => {
  const id = req.params.itemId;
  const updateOps = [];

  for (let ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  Item.update({ _id: id }, { $set: updateOps })
    .then(
      res.status(200).send({
        message: 'Item edited successfully',
        request: {
          type: 'GET',
          description: 'Get updated item',
          url:
            req.protocol +
            '://' +
            req.get('host') +
            req.originalUrl +
            req.params.item_id,
        },
      })
    )
    .catch((err) => res.status(500).send({ error: err }));
});

router.delete('/:itemId', (req, res, next) => {
  const id = req.params.itemId;

  Item.remove({ _id: id })
    .then((result) => {
      console.log(result);
      res.status(200).send({ message: 'Item deleted' });
    })
    .catch((err) => res.status(500).send({ err: err }));
});

module.exports = router;
