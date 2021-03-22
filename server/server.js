import './app/config/index.js';
import express from 'express';
import * as path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import db from './app/config/db.js';
import init from './app/routes/index.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

db();
init(app);

if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve(path.dirname(''));
    app.use(express.static(path.resolve(__dirname, '../client/build')));
    app.get('*', (_, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    });
}

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});