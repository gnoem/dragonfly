import Controller from '../controllers/index.js';
import { validate } from '../middleware/index.js';

export default (app) => {
    app.route('/user/:_id/data')
        .get(Controller.getUserData);
    /* app.route('/user')
        .post(Controller.createUser);
    app.route('/account')
        .post(Controller.createAccount);
    app.route('/account/:id')
        .put(Controller.editAccount)
        .delete(Controller.deleteAccount);
    app.route('/note')
        .post(Controller.createNote);
    app.route('/note/:id/:action')
        .put(Controller.editNote)
        .delete(Controller.deleteNote);
    app.route('/tag')
        .post(Controller.createTag);
    app.route('/tag/:name')
        .put(Controller.editTag)
        .delete(Controller.deleteTag);
    app.route('/collection')
        .post(Controller.createCollection);
    app.route('/collection/:name')
        .put(Controller.editCollection)
        .delete(Controller.deleteCollection); */
    app.get('/auth/:id', Controller.auth);
    app.post('/logout/user', Controller.logoutUser);
    app.post('/login/user', Controller.loginUser);
    app.post('/create/user', Controller.createUser);
    app.post('/get/data', Controller.getData);
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
    app.post('/delete/account', Controller.deleteAccount);
}