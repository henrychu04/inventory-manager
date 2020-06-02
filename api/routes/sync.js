const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Item = require('../models/item');
const Month = require('../models/month');

router.get('/', async function(req, res, next) {
    var items = [];
    var months = [];

    await Item.find().then(docs => items = docs);
    await Month.find().then(docs => months = docs);

    for (let i = 0; i < items.length; i++) {
        var match = false;

        for (let j = 0; j < months.length; j++) {
            if (months[j].expense.length == 0) {
                if (months[j].deposit._id.equals(items[i]._id)) {
                    match = true;
                }
            } else {
                if (months[j].expense._id.equals(items[i]._id)) {
                    match = true;
                }
            }
        }

        if (!match) {
            await addToMonth(items[i])
                .then(
                    res.status(200).json({
                        message: 'Synced'
                    })
                )
                .catch(err => {
                    res.status(500).json({
                        err: err
                    });
                });
        }
    }

    for (let i = 0; i < months.length; i++) {
        var need_deletion = true;

        for (let j = 0; j < items.length; j++) {
            if (months[j].expense.length == 0) {
                if (months[i].deposit._id.equals(items[j]._id)) {
                    need_deletion = false;
                }
            } else {
                if (months[i].expense._id.equals(items[j]._id)) {
                    need_deletion = false;
                }
            }
        }

        if (need_deletion) {
            delete_month(months[i]._id)
                .then(
                    res.status(200).json({
                        message: 'Synced'
                    })
                )
                .catch(err => {
                    res.status(500).json({
                        err: err
                    });
                });
        }
    }

    res.status(200).json({
        message: 'Synced'
    });
});

function addToMonth(item) {
    let month;

    if (item.expense == 0) {
        month = new Month({
            _id: new mongoose.Types.ObjectId(),
            month: item.date.getMonth(),
            deposit: item._id
        });
    } else {
        month = new Month({
            _id: new mongoose.Types.ObjectId(),
            month: item.date.getMonth(),
            expense: item._id
        });
    }

    month
        .save()
        .catch(err => {
            console.log(err); 
        });
}

function delete_month(id) {
    Month.remove({ _id: id })
        .catch(err => {
            console.log(err);
        });
}

module.exports = router;