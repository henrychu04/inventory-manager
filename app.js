const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.URI;

const items_routes = require('./api/routes/items');
const month_routes = require('./api/routes/month');
const sync_routes = require('./api/routes/sync');

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Origin-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method === 'OPTIONS') {
        res.header(
            "Access-Control-Allow-Methods", 
            "GET, PUT, POST, PATCH, DELETE"
        );

        return res.status(200).json({});
    }

    next();
})

app.use('/items', items_routes);
app.use('/month', month_routes);
app.use('/sync', sync_routes);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.log(err);
    res.json({
        err: {
            message: err.message
        }
    });
});

module.exports = app;