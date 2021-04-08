import './app/config/index.js';
import express from 'express';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import db from './app/config/db.js';
import init from './app/routes/index.js';

const app = express();

// priority serve any static files
const __dirname = path.resolve(path.dirname(''));
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

db();
init(app);

// handle remaining requests
app.get('*', (_, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});