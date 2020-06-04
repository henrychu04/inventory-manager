const express = require('express');
const router = express.Router();

const Month = require('../models/month');
const Item = require('../models/item');

router.get('/:monthId', async function (req, res, next) {
  var expenses = [];
  var deposits = [];

  await Month.find({ month: req.params.monthId }).then(async (docs) => {
    if (docs) {
      for (let doc in docs) {
        if ('expense' in doc) {
          await Item.findById(doc.deposit)
            .select('-__v')
            .then((docs) => {
              deposits.push(docs);
            });
        } else {
          await Item.findById(doc.expense)
            .select('-__v')
            .then((docs) => {
              expenses.push(docs);
            });
        }
      }
    } else {
      res.status(200).send({ message: 'No sales in current month' });
    }
  });

  if (expenses.length != 0 || deposits.length != 0) {
    let expensesAmount = 0;
    let depositsAmount = 0;

    for (let expenseItem in expenses) {
      await Item.findById(expenseItem._id).then((doc) => {
        expensesAmount += doc.expense;
      });
    }

    for (let depositItem in deposits) {
      await Item.findById(depositItem._id).then((doc) => {
        depositsAmount += doc.deposit;
      });
    }

    res.status(200).send({
      expenses: expenses,
      deposits: deposits,
      expenseTotal: expensesAmount,
      depositTotal: depositsAmount,
    });
  }
});

module.exports = router;
