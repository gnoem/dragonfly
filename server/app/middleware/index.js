import { check } from 'express-validator';
import { User, Collection, Tag } from '../models/index.js';

export const validate = {
    createAccount: [
        check('email')
            .not().isEmpty().withMessage('This field is required').bail()
            .isEmail().withMessage('Please enter a valid email address').bail()
            .normalizeEmail()
            .custom(email => {
                return User.findOne({ email }).then(user => {
                    if (user) return Promise.reject('Email address is already in use');
                });
            }),
        check('username')
            .not().isEmpty().withMessage('This field is required').bail()
            .isAlphanumeric().withMessage('Username cannot contain any special characters').bail()
            .isLength({ min: 2, max: 50 }).withMessage('Username must be between 2 and 50 characters').bail()
            .toLowerCase()
            .custom(username => {
                return User.findOne({ username }).then(user => {
                    if (user) return Promise.reject('Username is taken');
                });
            }),
        check('password')
            .not().isEmpty().withMessage('This field is required').bail()
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    editAccount: [
        check('email')
            .not().isEmpty().withMessage('This field is required').bail()
            .isEmail().withMessage('Please enter a valid email address').bail()
            .normalizeEmail()
            .custom((email, { req }) => {
                return User.findOne({ email }).then(user => {
                    if (user && (user._id.toString() !== req.params._id)) return Promise.reject('Email address is already in use');
                });
            }).bail(),
        check('username')
            .not().isEmpty().withMessage('This field is required').bail()
            .isAlphanumeric().withMessage('Username cannot contain any special characters').bail()
            .isLength({ min: 2, max: 50 }).withMessage('Username must be between 2 and 50 characters').bail()
            .toLowerCase()
            .custom((username, { req }) => {
                return User.findOne({ username }).then(user => {
                    if (user && (user._id.toString() !== req.params._id)) return Promise.reject('Username is taken');
                });
            })
    ],
    collectionName: [
        check('name')
            .not().isEmpty().withMessage('This field is required').bail()
            .isLength({ max: 25 }).withMessage('Limit 25 characters').bail()
            .custom((name, { req }) => {
                return Collection.findOne({ userId: req.body.userId, name: name }).then(collection => {
                    if (!collection) return;
                    const creatingCollection = !req.params?._id;
                    if (!creatingCollection && (collection._id.toString() === req.params._id)) return;
                    return Promise.reject('Collection already exists');
                });
            })
    ],
    tagName: [
        check('name')
            .not().isEmpty().withMessage('This field is required').bail()
            .isLength({ max: 25 }).withMessage('Limit 25 characters').bail()
            .custom((name, { req }) => {
                return Tag.findOne({ userId: req.body.userId, name: name }).then(tag => {
                    if (!tag) return;
                    const creatingTag = !req.params?._id;
                    if (!creatingTag && (tag._id.toString() === req.params._id)) return;
                    return Promise.reject('Tag already exists');
                });
            })
    ],
}