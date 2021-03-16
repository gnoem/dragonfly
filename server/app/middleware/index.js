import { check } from 'express-validator';
import { User } from '../models/index.js';

export const validate = {
    createCollection: [
        check('collectionName')
            .isLength({ min: 1, max: 25 }).withMessage('Collection name must be between 1 and 25 characters')
    ],
    editCollection: [
        check('updatedName')
            .isLength({ min: 1, max: 25 }).withMessage('Collection name must be between 1 and 25 characters')
    ],
    createTag: [
        check('tagName')
            .isLength({ min: 1, max: 25 }).withMessage('Tag name must be between 1 and 25 characters')
    ],
    editTag: [
        check('updatedName')
            .isLength({ min: 1, max: 25 }).withMessage('Tag name must be between 1 and 25 characters')
    ],
    accountDetails: [
        check('email')
            .not().isEmpty().withMessage('This field is required').bail()
            .isEmail().withMessage('Please enter a valid email address').bail()
            .custom(email => {
                return User.findOne({ email }).then(user => {
                    if (user) return Promise.reject('Email address is already in use');
                });
            }).bail()
            .normalizeEmail(),
        check('username')
            .not().isEmpty().withMessage('This field is required').bail()
            .isAlphanumeric().withMessage('Username cannot contain any special characters').bail()
            .isLength({ min: 2, max: 50 }).withMessage('Username must be between 2 and 50 characters').bail()
            .custom(username => {
                return User.findOne({ username }).then(user => {
                    if (user) return Promise.reject('Username is taken');
                });
            }).bail()
            .toLowerCase(),
        check('password')
            .not().isEmpty().withMessage('This field is required').bail()
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ]
}