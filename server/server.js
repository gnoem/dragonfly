import './app/config/index.js';
import express from 'express';
import * as path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import db from './app/config/db.js';
import init from './app/routes/index.js';

const app = express();

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('../client/build'));
    app.get('*', (_, res) => {
        res.sendFile('../client/build/index.html');
    });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

db();
init(app);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});