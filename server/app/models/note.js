const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = mongoose.model(
    'Note',
    new Schema({
        userId: String,
        title: String,
        content: String,
        tags: [String],
        category: String,
        starred: Boolean,
        trash: Boolean,
        createdAt: Date,
        lastModified: Date
    }),
    'notes'
);