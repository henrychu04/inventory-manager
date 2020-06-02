const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Month = require('../models/month');
const Item = require('../models/item');

router.get('/:month_id', async function(req, res, next) {
    var expenses = [];
    var deposits = [];

    await Month.find({ month: req.params.month_id })
        .then(async docs => {
            if (docs.length > 0) {
                for (let i = 0; i < docs.length; i++) {
                    if (docs[i].expense.length == 0) {
                        await Item.findById(docs[i].deposit)
                            .select('-__v')
                            .then(docs => {
                                deposits.push(docs);
                            });
                    } else {
                        await Item.findById(docs[i].expense)
                            .select('-__v')
                            .then(docs => {
                                expenses.push(docs);
                            });
                    }
                }
            } else {
                res.status(200).json({
                    message: 'No sales in current month'
                });
            }
        });
    
    if (expenses.length != 0 || deposits.length != 0) {
        let expenses_amount = 0;
        let deposits_amount = 0;

        for (let i = 0; i < expenses.length; i++) {
            await Item.findById(expenses[i]._id)
                .then(doc => {
                    expenses_amount += doc.expense;
                });
        }

        for (let i = 0; i < deposits.length; i++) {
            await Item.findById(deposits[i]._id)
                .then(doc => {
                    deposits_amount += doc.deposit;
                });
        }

        res.status(200).json({
            expenses: expenses,
            deposits: deposits,
            expense_total: expenses_amount,
            deposit_total: deposits_amount
        })
    }
});

module.exports = router;