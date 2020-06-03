const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.URI;

const indexRoutes = require('./api/routes/index');
const itemsRoutes = require('./api/routes/items');
const monthRoutes = require('./api/routes/month');
const syncRoutes = require('./api/routes/sync');

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

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

        return res.status(200);
    }

    next();
})

app.use('/', indexRoutes);
app.use('/items', itemsRoutes);
app.use('/month', monthRoutes);
app.use('/sync', syncRoutes);

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