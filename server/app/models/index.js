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
        hideWelcomeMessage: {
            type: Boolean,
            default: false
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
        userId: { type: String, required: true },
        name: { type: String, required: true },
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

export const Token = mongoose.model(
    'Token',
    new Schema({
        userId: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }, { timestamps: true }).index({ 'updatedAt': 1 }, {
        expireAfterSeconds: (process.env.NODE_ENV === 'production') ? 7200 : 600
    }),
    'tokens'
);