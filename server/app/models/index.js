import mongoose from 'mongoose';
const { Schema } = mongoose;

export const User = mongoose.model(
    'User',
    new Schema({
        firstName: String,
        lastName: String,
        email: String,
        username: String,
        password: String,
        collections: [],
        tags: [],
        settings: {
            darkMode: Boolean,
            theme: String
        }
    }),
    'users'
);

export const Note = mongoose.model(
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