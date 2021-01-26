const { check } = require('express-validator');
const User = require('../models/user');

module.exports = {
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
    createAccount: [
        check('email').isEmail().withMessage('Please enter a valid email address')
            .custom(value => {
                return User.findOne({ email: value }).then(user => {
                    if (user) return Promise.reject('Email address is already in use!');
                });
            }),
        check('username').isAlphanumeric().withMessage('Your username may not contain any special characters')
            .isLength({ min: 1, max: 23 }).withMessage('Username must be between 1 and 23 characters')
            .custom(value => {
                return User.findOne({ username: value }).then(user => {
                    if (user) return Promise.reject('Username is already in use!');
                });
            }),
        check('password').isLength({ min: 6 }).withMessage('Minimum is 6 characters')
    ],
    editAccount: [
        check('email')
            .isEmail().withMessage('Please enter a valid email address'),
        check('username')
            .isAlphanumeric().withMessage('Your username may not contain any special characters')
            .isLength({ min: 1, max: 23 }).withMessage('Username must be between 1 and 23 characters'),
        check('password')
            .isLength({ min: 6 }).withMessage('Minimum is 6 characters')
    ]
}