/* const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); */
import './app/config/index.js';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import db from './app/config/db.js';
import init from './app/routes/index.js';

const app = express();

if (process.env.NODE_ENV === 'production') app.use(express.static('../client/build'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

db();
init(app);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});