const express = require('express');
const router = express.Router();

const Item = require('../models/item');
const Month = require('../models/month');

router.get('/', async function (req, res, next) {
  let items = [];
  let months = [];

  await Item.find().then((docs) => (items = docs));
  await Month.find().then((docs) => (months = docs));

  for (let item in items) {
    let match = false;

    for (let obj in months) {
      if ('deposit' in obj) {
        if (obj.deposit._id.equals(item._id)) {
          match = true;
        }
      } else {
        if (obj.expense._id.equals(item._id)) {
          match = true;
        }
      }
    }

    if (!match) {
      await addToMonth(item)
        .then(res.status(200).send({ message: 'Synced' }))
        .catch((err) => res.status(500).send({ err: err }));
    }
  }

  for (let obj in months) {
    let needDeletion = true;

    for (let item in items) {
      if ('deposit' in obj) {
        if (obj.deposit._id.equals(item._id)) {
          needDeletion = false;
        }
      } else {
        if (obj.expense._id.equals(item._id)) {
          needDeletion = false;
        }
      }
    }

    if (needDeletion) {
      await Month.remove({ _id: obj._id })
        .then(res.status(200).send({ message: 'Synced' }))
        .catch((err) => res.status(500).send({ err: err }));
    }
  }

  res.status(200).send({ message: 'Synced' });
});

async function addToMonth(item) {
  let month;

  if ('expense' in item) {
    month = new Month({
      month: item.date.getMonth(),
      deposit: item._id,
    });
  } else {
    month = new Month({
      month: item.date.getMonth(),
      expense: item._id,
    });
  }

  await month.save().catch((err) => console.log(err));
}

module.exports = router;
