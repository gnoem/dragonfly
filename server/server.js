const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./app/config/db')();
require('./app/routes')(app);

const PORT = 6000;
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});