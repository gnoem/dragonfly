const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = mongoose.model(
    'Note',
    new Schema({
        userId: String,
        title: String,
        body: String,
        tags: [String],
        createdAt: Date,
        lastModified: Date
    }),
    'notes'
);