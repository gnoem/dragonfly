const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = mongoose.model(
    'Note',
    new Schema({
        userId: String,
        title: String,
        content: String,
        tags: [String],
        collections: [String],
        starred: Boolean,
        createdAt: {
            type: Date,
            default: Date.now()
        },
        lastModified: {
            type: Date,
            default: Date.now()
        }
    }),
    'notes'
);