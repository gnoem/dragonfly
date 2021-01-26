const controller = require('../controllers');
const validate = require('../middleware');

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
    app.post('/create/collection', validate.createCollection, controller.createCollection);
    app.post('/edit/collection', validate.editCollection, controller.editCollection);
    app.post('/delete/collection', controller.deleteCollection);
    app.post('/create/tag', validate.createTag, controller.createTag);
    app.post('/edit/tag', validate.editTag, controller.editTag);
    app.post('/delete/tag', controller.deleteTag);
    app.post('/create/account', validate.createAccount, controller.createAccount);
    app.post('/edit/account', validate.editAccount, controller.editAccount);
    app.post('/edit/password', controller.editPassword);
    app.post('/delete/account', controller.deleteAccount);
}