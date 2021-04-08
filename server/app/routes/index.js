import { check } from 'express-validator';
import Controller from '../controllers/index.js';
import { validate } from '../middleware/index.js';

export default (app) => {
    app.route('/auth/:identifier')
        .get(Controller.auth);
    app.route('/login/:username')
        .post(Controller.login);
    app.route('/logout')
        .get(Controller.logout);
    app.route('/token')
        .post([check('email').notEmpty().withMessage('This field is required')], Controller.resetPassword);
    app.route('/token/:token')
        .get(Controller.validateToken);
    app.route('/user/:_id/data')
        .get(Controller.getUser);
    app.route('/user')
        .post(Controller.createUser);
    app.route('/user/:_id')
        .post(validate.createAccount, Controller.createAccount)
        .put(validate.editAccount, Controller.editAccount)
        .delete(Controller.deleteAccount);
    app.route('/user/:_id/password')
        .put(Controller.editPassword);
    app.route('/note')
        .post(Controller.createNote);
    app.route('/note/:_id')
        .delete(Controller.deleteNote);
    app.route('/note/:_id/:action')
        .put(Controller.editNote);
    app.route('/notes-in-trash/:userId')
        .put(Controller.restoreTrash)
        .delete(Controller.emptyTrash);
    app.route('/tag')
        .post(validate.tagName, Controller.createTag);
    app.route('/tag/:_id')
        .put(validate.tagName, Controller.editTag)
        .delete(Controller.deleteTag);
    app.route('/collection')
        .post(validate.collectionName, Controller.createCollection);
    app.route('/collection/:_id')
        .put(validate.collectionName, Controller.editCollection)
        .delete(Controller.deleteCollection); /*
    //app.post('/logout/user', Controller.logoutUser);
    //app.post('/login/user', Controller.loginUser);
    //app.post('/create/user', Controller.createUser);
    //app.post('/get/data', Controller.getData);
    app.post('/add/note', Controller.createNote);
    app.post('/edit/note', Controller.editNote);
    app.post('/star/note', Controller.starNote);
    app.post('/categorize/note', Controller.moveNoteToCollection);
    app.post('/tag/note', Controller.tagNote);
    app.post('/trash/note', Controller.trashNote);
    app.post('/delete/note', Controller.deleteNote);
    app.post('/empty/trash', Controller.emptyTrash);
    app.post('/create/collection', validate.createCollection, Controller.createCollection);
    app.post('/edit/collection', validate.editCollection, Controller.editCollection);
    app.post('/delete/collection', Controller.deleteCollection);
    app.post('/create/tag', validate.createTag, Controller.createTag);
    app.post('/edit/tag', validate.editTag, Controller.editTag);
    app.post('/delete/tag', Controller.deleteTag);
    app.post('/create/account', validate.createAccount, Controller.createAccount);
    app.post('/edit/account', validate.editAccount, Controller.editAccount);
    app.post('/edit/password', Controller.editPassword);
    app.post('/delete/account', Controller.deleteAccount); */
}