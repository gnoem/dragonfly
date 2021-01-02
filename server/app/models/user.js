const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = mongoose.model(
    'User',
    new Schema({
        firstName: String,
        lastName: String,
        email: String,
        username: String,
        password: String,
        settings: {
            darkMode: Boolean,
            theme: String
        }
    }),
    'users'
)