const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const User = require('../models/user');
const Note = require('../models/note');

module.exports = (app) => {
    app.get('/auth/:id', (req, res) => {
        const { id } = req.params;
        const token = req.cookies.auth;
        if (!token) {
            return console.log('failed to authorize user');
        }
        const decoded = jwt.verify(token, secret);
        if (id !== decoded.id) {
            res.status(401).send({
                success: false,
                error: 'wrong token'
            });
            return;
        }
        res.status(200).send({
            success: true,
            accessToken: token
        });
    });
    app.post('/logout/user', (req, res) => {
        res.clearCookie('auth');
        res.status(200).send({ success: true });
    });
    app.post('/login/user', (req, res) => {
        const { username, password } = req.body;
        User.findOne({ username }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${username} not found`);
            const passwordIsValid = () => {
                return bcrypt.compareSync(password, user.password);
            }
            if (!passwordIsValid()) {
                res.status(401).send({
                    success: false,
                    error: 'invalid-password'
                });
                return;
            }
            let token = jwt.sign({ id: user.id }, secret, {
                expiresIn: 86400 // 24 hours
            });
            res.cookie('auth', token, { httpOnly: true, secure: false, maxAge: 3600000 });
            res.status(200).send({
                success: true,
                accessToken: token
            });
        });
    });
    app.post('/create/user', (req, res) => {
        const newUser = new User();
        newUser.save(err => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error saving new user', err);
            }
            res.status(200).send({
                success: true,
                user: newUser
            });
        });
    });
    app.post('/get/data', (req, res) => {
        let { id } = req.body;
        const searchingById = id.length === 24;
        let userParams;
        if (searchingById) userParams = { _id: id };
        else userParams = { username: id };
        User.findOne(userParams, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${id} not found`);
            if (!searchingById) id = user._id;
            Note.find({ userId: id }).sort({ lastModified: 'desc' }).exec((err, notes) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error finding notes', err);
                }
                let preparedNotes = [];
                for (let i = 0; i < notes.length; i++) {
                    const { _id, userId, title, content, tags, category, starred, trash, createdAt, lastModified } = notes[i];
                    preparedNotes.push({
                        _id, userId, title, content: JSON.parse(content), tags, collection: category, starred, trash, createdAt, lastModified
                    });
                }
                res.status(200).send({
                    success: true,
                    user,
                    notes: preparedNotes
                });
            });
        });
    });
    app.post('/add/note', (req, res) => {
        console.log('well its working');
        const { id, title, content } = req.body;
        const newNote = new Note({
            userId: id,
            title,
            content: JSON.stringify(content),
            createdAt: Date.now(),
            lastModified: Date.now()
        });
        newNote.save(err => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error saving note', err);
            }
            console.log('success!');
            res.status(200).send({
                success: true,
                id: newNote._id
            });
        });
    });
    app.post('/edit/note', (req, res) => {
        const { id, title, content } = req.body;
        Note.findOne({ _id: id }, (err, note) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding note', err);
            }
            if (!note) return console.log(`note ${id} not found`);
            note.title = title;
            note.content = JSON.stringify(content);
            note.lastModified = Date.now();
            note.save(err => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error saving note', err);
                }
                console.log('successfully edited note');
                res.status(200).send({ success: true });
            });
        });
    });
    app.post('/star/note', (req, res) => {
        const { _id } = req.body;
        console.log('starring note');
        Note.findOne({ _id }, (err, note) => {
            console.log('findig note');
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding note', err);
            }
            if (!note) return console.log(`note ${_id} not found`);
            note.starred = !note.starred;
            note.save(err => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error saving note', err);
                }
                res.status(200).send({ success: true });
            });
        });
    });
    app.post('/categorize/note', (req, res) => {
        const { _id, collectionName } = req.body;
        Note.findOne({ _id }, (err, note) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!note) return console.log(`note ${_id} not found`);
            note.category = collectionName;
            note.save(err => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error saving note', err);
                }
                res.status(200).send({ success: true });
            });
        });
    });
    app.post('/tag/note', (req, res) => {
        const { _id, tagName } = req.body;
        Note.findOne({ _id }, (err, note) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding note', err);
            }
            if (!note) return console.log(`note ${_id} not found`);
            const noteAlreadyHasTag = () => note.tags && (note.tags.indexOf(tagName) !== -1);
            if (noteAlreadyHasTag()) {
                let index = note.tags.indexOf(tagName)
                note.tags.splice(index, 1);
            } else {
                if (!note.tags) note.tags = [tagName];
                else note.tags.push(tagName);
            }
            note.save(err => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error saving note', err);
                }
                res.status(200).send({ success: true });
            });
        });
    });
    app.post('/trash/note', (req, res) => { // or untrash; note.trash = !note.trash
        const { _id } = req.body;
        Note.findOne({ _id }, (err, note) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding note', err);
            }
            if (!note) return console.log(`note ${_id} not found`);
            note.trash = !note.trash;
            note.save(err => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error saving note', err);
                }
                res.status(200).send({ success: true });
            });
        });
    });
    app.post('/delete/note', (req, res) => {
        const { id } = req.body;
        Note.findOneAndDelete({ _id: id }, (err, note) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding note', err);
            }
            if (!note) return console.log(`note ${id} not found`);
            console.log('deleting note');
            res.status(200).send({ success: true });
        })
    });
    app.post('/empty/trash', (req, res) => {
        const { _id } = req.body;
        Note.deleteMany({ userId: _id, trash: true }, (err) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error deleting notes', err);
            }
            res.status(200).send({ success: true });
        });
    });
    app.post('/create/collection', [
        check('collectionName')
            .isLength({ min: 1, max: 25 }).withMessage('Collection name must be between 1 and 25 characters')
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const generateError = (type) => {
                let error = errors.errors.find(error => error.param === type);
                if (error) return error.msg; else return false;
            }
            res.send({
                success: false,
                collectionNameError: generateError('collectionName')
            });
            return;
        }
        const { _id , collectionName } = req.body;
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${_id} not found`);
            const collectionAlreadyExists = (name) => {
                if (!user.collections || !user.collections.length) return false;
                let index = user.collections.indexOf(name);
                if (index !== -1) return true;
                return false;
            }
            if (collectionAlreadyExists(collectionName)) {
                console.log(`collection ${collectionName} already exists!`);
                res.send({
                    success: false,
                    collectionNameError: "A collection with this name already exists!"
                });
                return;
            }
            if (!user.collections) user.collections = [collectionName];
            else user.collections.push(collectionName);
            user.save(err => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error saving user', err);
                }
                res.status(200).send({ success: true });
            });
        });
    });
    app.post('/edit/collection', [
        check('updatedName')
            .isLength({ min: 1, max: 25 }).withMessage('Collection name must be between 1 and 25 characters')
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const generateError = (type) => {
                let error = errors.errors.find(error => error.param === type);
                if (error) return error.msg; else return false;
            }
            res.send({
                success: false,
                updatedNameError: generateError('updatedName')
            });
            return;
        }
        const { _id, collectionName, updatedName } = req.body;
        if (collectionName === updatedName) {
            res.status(200).send({ success: true });
            return;
        }
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${_id} not found`);
            const collectionAlreadyExists = (name) => {
                if (!user.collections || !user.collections.length) return false;
                let index = user.collections.indexOf(name);
                if (index !== -1) return true;
                return false;
            }
            if (collectionAlreadyExists(updatedName)) {
                console.log(`collection ${updatedName} already exists!`);
                res.send({
                    success: false,
                    updatedNameError: "A collection with this name already exists!"
                });
                return;
            }
            let index = user.collections.indexOf(collectionName);
            if (index === -1) return console.log('collection not found!');
            user.collections.splice(index, 1, updatedName);
            Note.find({ userId: user._id }, (err, notes) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error finding notes', err);
                }
                const updateNotes = (array) => {
                    for (let i = 0; i < array.length; i++) {
                        // find all that belong to this collection and change the collection name
                        if (array[i].category === collectionName) array[i].category = updatedName;
                        array[i].save();
                    }
                }
                updateNotes(notes);
                user.save(err => {
                    if (err) {
                        res.status(500).send({
                            success: false,
                            err
                        });
                        return console.error('error saving user', err);
                    }
                    res.status(200).send({ success: true });
                });
            });
        });
    });
    app.post('/delete/collection', (req, res) => {
        const { _id, collectionName } = req.body;
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${_id} not found`);
            if (!user.collections) return console.log('something went way wrong');
            let index = user.collections.indexOf(collectionName);
            if (index === -1) return console.log('something went wayyy wrong');
            user.collections.splice(index, 1);
            Note.find({ userId: user._id }, (err, notes) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error finding notes', err);
                }
                if (!notes) return console.log(`notes with userId ${user._id} not found`);
                const updateNotes = (array) => {
                    for (let i = 0; i < array.length; i++) {
                        // find all that belong to this collection and change to false
                        // todo: option to migrate these notes to a different collection?
                        if (array[i].category === collectionName) array[i].category = '';
                        array[i].save();
                    }
                }
                updateNotes(notes);
                user.save(err => {
                    if (err) {
                        res.status(500).send({
                            success: false,
                            err
                        });
                        return console.error('error saving user', err);
                    }
                    res.status(200).send({ success: true });
                });
            });
        });
    });
    app.post('/create/tag', [
        check('tagName')
            .isLength({ min: 1, max: 25 }).withMessage('Tag name must be between 1 and 25 characters')
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const generateError = (type) => {
                let error = errors.errors.find(error => error.param === type);
                if (error) return error.msg; else return false;
            }
            res.send({
                success: false,
                tagNameError: generateError('tagName')
            });
            return;
        }
        const { _id, tagName } = req.body;
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${username} not found`);
            const tagAlreadyExists = (name) => {
                if (!user.tags || !user.tags.length) return false;
                let index = user.tags.indexOf(name);
                if (index !== -1) return true;
                return false;
            }
            if (tagAlreadyExists(tagName)) {
                console.log(`tag ${tagName} already exists!`);
                res.send({
                    success: false,
                    tagNameError: "A tag with this name already exists."
                });
                return;
            }
            if (!user.tags) user.tags = [tagName];
            else user.tags.push(tagName);
            user.save(err => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error saving user', err);
                }
                res.status(200).send({ success: true });
            });
        });
    });
    app.post('/edit/tag', [
        check('updatedName')
            .isLength({ min: 1, max: 25 }).withMessage('Tag name must be between 1 and 25 characters')
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const generateError = (type) => {
                let error = errors.errors.find(error => error.param === type);
                if (error) return error.msg; else return false;
            }
            res.send({
                success: false,
                updatedNameError: generateError('updatedName')
            });
            return;
        }
        const { _id, tagName, updatedName } = req.body;
        if (tagName === updatedName) { // remove if adding more options later, like tag color
            res.status(200).send({ success: true });
            return;
        }
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${_id} not found`);
            const tagAlreadyExists = (name) => {
                if (!user.tags || !user.tags.length) return false;
                let index = user.tags.indexOf(name);
                if (index !== -1) return true;
                return false;
            }
            if (tagAlreadyExists(updatedName)) {
                console.log(`tag ${updatedName} already exists!`);
                res.send({
                    success: false,
                    updatedNameError: "A tag with this name already exists."
                });
                return;
            }
            let index = user.tags.indexOf(tagName);
            if (index === -1) return console.log('tag not found!');
            user.tags.splice(index, 1, updatedName);
            Note.find({ userId: _id }, (err, notes) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error finding notes', err);
                }
                const updateNotes = (array) => {
                    for (let i = 0; i < array.length; i++) {
                        // find all that have this tag and change the tag name in the tag array
                        let thisNote = array[i];
                        let thisNotesTags = thisNote.tags;
                        let tagIndex = thisNotesTags.indexOf(tagName);
                        let noteHasTag = tagIndex !== -1;
                        if (noteHasTag) {
                            thisNotesTags.splice(tagIndex, 1, updatedName);
                            thisNote.save();
                        }
                    }
                }
                updateNotes(notes);
                user.save(err => {
                    if (err) {
                        res.status(500).send({
                            success: false,
                            err
                        });
                        return console.error('error saving user', err);
                    }
                    res.status(200).send({ success: true });
                });
            });
        });
    });
    app.post('/delete/tag', (req, res) => {
        const { _id, tagName } = req.body;
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${_id} not found`);
            let index = user.tags.indexOf(tagName);
            if (index === -1) return console.log('something went wayyy wrong');
            user.tags.splice(index, 1);
            Note.find({ userId: _id }, (err, notes) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error finding notes', err);
                }
                if (!notes) return console.log(`notes with userId ${_id} not found`);
                const updateNotes = (array) => {
                    for (let i = 0; i < array.length; i++) {
                        let thisNote = array[i];
                        let thisNotesTags = thisNote.tags;
                        let tagIndex = thisNotesTags.indexOf(tagName);
                        let noteHasTag = tagIndex !== -1;
                        if (!noteHasTag) return;
                        thisNotesTags.splice(tagIndex, 1);
                        thisNote.save();
                    }
                }
                updateNotes(notes);
                user.save(err => {
                    if (err) {
                        res.status(500).send({
                            success: false,
                            err
                        });
                        return console.error('error saving user', err);
                    }
                    res.status(200).send({ success: true });
                });
            });
        });
    });
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
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const generateError = (type) => {
                let error = errors.errors.find(error => error.param === type);
                if (error) return error.msg; else return false;
            }
            const errorReport = {
                emailError: generateError('email'),
                usernameError: generateError('username'),
                passwordError: generateError('password')
            }
            res.send({
                success: false,
                errorReport
            });
            return;
        }
        const { _id, firstName, lastName, email, username, password } = req.body;
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${_id} not found`);
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            user.username = username;
            user.password = bcrypt.hashSync(password, 8);
            user.save(err => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error saving user', err);
                }
                let token = jwt.sign({ id: user.id }, secret, {
                    expiresIn: 86400 // 24 hours
                });
                res.cookie('auth', token, { httpOnly: true, secure: false, maxAge: 3600000 });
                res.status(200).send({ success: true });
            });
        });
    });
    app.post('/edit/account', [
        check('email')
            .isEmail().withMessage('Please enter a valid email address'),
        check('username')
            .isAlphanumeric().withMessage('Your username may not contain any special characters')
            .isLength({ min: 1, max: 23 }).withMessage('Username must be between 1 and 23 characters'),
        check('password')
            .isLength({ min: 6 }).withMessage('Minimum is 6 characters')
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const generateError = (type) => {
                let error = errors.errors.find(error => error.param === type);
                if (error) return error.msg; else return false;
            }
            const errorReport = {
                emailError: generateError('email'),
                usernameError: generateError('username'),
                passwordError: generateError('password')
            }
            res.send({
                success: false,
                errorReport
            });
            return;
        }
        const { _id, firstName, lastName, email, username, password } = req.body;
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${_id} not found`);
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            user.username = username;
            user.password = bcrypt.hashSync(password, 8);
            user.save(err => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error saving user', err);
                }
                res.status(200).send({ success: true });
            });
        });
    });
    app.post('/edit/password', (req, res) => {
        const { _id, password } = req.body;
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${_id} not found`);
            user.password = bcrypt.hashSync(password, 8);
            user.save(err => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error saving user', err);
                }
                res.status(200).send({ success: true });
            });
        });
    });
    app.post('/delete/account', (req, res) => {
        const { _id } = req.body;
        User.findOneAndDelete({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) return console.log(`user ${_id} not found`);
            Note.deleteMany({ userId: _id }, (err) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error deleting notes', err);
                }
                res.status(200).send({ success: true });
            });
        });
    });
}