const { check } = require('express-validator');
const User = require('../models/user');
const controller = require('../controllers');

module.exports = (app) => {
    app.get('/auth/:id', controller.auth);
    app.post('/logout/user', controller.logoutUser);
    app.post('/login/user', controller.loginUser);
    app.post('/create/user', controller.createUser);
    app.post('/get/data', controller.getData);
    app.post('/add/note', controller.createNote);
    app.post('/edit/note', controller.editNote);
    app.post('/star/note', controller.starNote);
    app.post('/categorize/note', controller.moveNoteToCollection);
    app.post('/tag/note', controller.tagNote);
    app.post('/trash/note', controller.trashNote);
    app.post('/delete/note', controller.deleteNote);
    app.post('/empty/trash', controller.emptyTrash);
    app.post('/create/collection', [
        check('collectionName')
            .isLength({ min: 1, max: 25 }).withMessage('Collection name must be between 1 and 25 characters')
    ], controller.createCollection);
    app.post('/edit/collection', [
        check('updatedName')
            .isLength({ min: 1, max: 25 }).withMessage('Collection name must be between 1 and 25 characters')
    ], controller.editCollection);
    app.post('/delete/collection', controller.deleteCollection);
    app.post('/create/tag', [
        check('tagName')
            .isLength({ min: 1, max: 25 }).withMessage('Tag name must be between 1 and 25 characters')
    ], controller.createTag);
    app.post('/edit/tag', [
        check('updatedName')
            .isLength({ min: 1, max: 25 }).withMessage('Tag name must be between 1 and 25 characters')
    ], controller.editTag);
    app.post('/delete/tag', controller.deleteTag);
    app.post('/create/account', [
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
    ], controller.createAccount);
    app.post('/edit/account', [
        check('email')
            .isEmail().withMessage('Please enter a valid email address'),
        check('username')
            .isAlphanumeric().withMessage('Your username may not contain any special characters')
            .isLength({ min: 1, max: 23 }).withMessage('Username must be between 1 and 23 characters'),
        check('password')
            .isLength({ min: 6 }).withMessage('Minimum is 6 characters')
    ], controller.editAccount);
    app.post('/edit/password', controller.editPassword);
    app.post('/delete/account', controller.deleteAccount);
}