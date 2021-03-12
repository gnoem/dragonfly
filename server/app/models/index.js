import mongoose from 'mongoose';
const { Schema } = mongoose;

export const User = mongoose.model(
    'User',
    new Schema({
        firstName: String,
        lastName: String,
        email: String,
        username: String,
        password: String
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
        collectionId: String,
        starred: Boolean,
        trash: Boolean,
        createdAt: Date,
        lastModified: Date
    }),
    'notes'
);

export const Collection = mongoose.model(
    'Collection',
    new Schema({
        userId: String,
        name: String,
        order: Number,
        // passwordProtected: Boolean???????
    }),
    'collections'
);

export const Tag = mongoose.model(
    'Tag',
    new Schema({
        userId: String,
        name: String,
        order: Number
    }),
    'tags'
);