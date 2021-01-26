const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const User = require('../models/user');
const Note = require('../models/note');

module.exports = {
    auth: (req, res) => {
        const { id } = req.params;
        const token = req.cookies.auth;
        if (!token) {
            res.status(404).send({
                success: false,
                error: `Access token not found`
            });
            return;
        }
        const decoded = jwt.verify(token, secret);
        if (id !== decoded.id) {
            res.status(401).send({
                success: false,
                error: 'Wrong token for requested user'
            });
            return;
        }
        res.status(200).send({
            success: true,
            accessToken: token
        });
    },
    logoutUser: (req, res) => {
        res.clearCookie('auth');
        res.status(200).send({ success: true });
    },
    loginUser: (req, res) => {
        const { username, password } = req.body;
        User.findOne({ username }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${username}" not found`
                });
                return;
            }
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
    },
    createUser: (req, res) => {
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
    },
    getData: (req, res) => {
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
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${id}" not found`
                });
                return;
            }
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
    },
    createNote: (req, res) => {
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
    },
    editNote: (req, res) => {
        const { id, title, content } = req.body;
        Note.findOne({ _id: id }, (err, note) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding note', err);
            }
            if (!note) {
                res.status(404).send({
                    success: false,
                    error: `Note "${id}" not found`
                });
                return;
            }
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
    },
    starNote: (req, res) => {
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
            if (!note) {
                res.status(404).send({
                    success: false,
                    error: `Note "${_id}" not found`
                });
                return;
            }
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
    },
    moveNoteToCollection: (req, res) => {
        const { _id, collectionName } = req.body;
        Note.findOne({ _id }, (err, note) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!note) {
                res.status(404).send({
                    success: false,
                    error: `Note "${_id}" not found`
                });
                return;
            }
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
    },
    tagNote: (req, res) => {
        const { _id, tagName } = req.body;
        Note.findOne({ _id }, (err, note) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding note', err);
            }
            if (!note) {
                res.status(404).send({
                    success: false,
                    error: `Note "${_id}" not found`
                });
                return;
            }
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
    },
    trashNote: (req, res) => { // or untrash; note.trash = !note.trash
        const { _id } = req.body;
        Note.findOne({ _id }, (err, note) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding note', err);
            }
            if (!note) {
                res.status(404).send({
                    success: false,
                    error: `Note "${_id}" not found`
                });
                return;
            }
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
    },
    deleteNote: (req, res) => {
        const { id } = req.body;
        Note.findOneAndDelete({ _id: id }, (err, note) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding note', err);
            }
            if (!note) {
                res.status(404).send({
                    success: false,
                    error: `Note "${id}" not found`
                });
                return;
            }
            res.status(200).send({ success: true });
        })
    },
    emptyTrash: (req, res) => {
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
    },
    createCollection: (req, res) => {
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
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${_id}" not found`
                });
                return;
            }
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
    },
    editCollection: (req, res) => {
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
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${_id}" not found`
                });
                return;
            }
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
            if (index === -1) {
                res.status(404).send({
                    success: false,
                    error: `Collection "${collectionName}" not found`
                });
                return;
            }
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
    },
    deleteCollection: (req, res) => {
        const { _id, collectionName } = req.body;
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${_id}" not found`
                });
                return;
            }
            if (!user.collections) {
                res.status(404).send({
                    success: false,
                    error: `No collections for user "${_id}" found`
                });
                return;
            }
            let index = user.collections.indexOf(collectionName);
            if (index === -1) {
                res.status(404).send({
                    success: false,
                    error: `Collection "${collectionName}" not found`
                });
                return;
            }
            user.collections.splice(index, 1);
            Note.find({ userId: user._id }, (err, notes) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error finding notes', err);
                }
                if (!notes.length) {
                    res.status(404).send({
                        success: false,
                        error: `Notes from user "${user._id}" not found`
                    });
                    return;
                }
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
    },
    createTag: (req, res) => {
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
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${_id}" not found`
                });
                return;
            }
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
    },
    editTag: (req, res) => {
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
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${_id}" not found`
                });
                return;
            }
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
            if (index === -1) {
                res.status(404).send({
                    success: false,
                    error: `Tag "${tagName}" not found`
                });
                return;
            }
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
    },
    deleteTag: (req, res) => {
        const { _id, tagName } = req.body;
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${_id}" not found`
                });
                return;
            }
            let index = user.tags.indexOf(tagName);
            if (index === -1) {
                res.status(404).send({
                    success: false,
                    error: `Tag "${tagName}" not found`
                });
                return;
            }
            user.tags.splice(index, 1);
            Note.find({ userId: _id }, (err, notes) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        err
                    });
                    return console.error('error finding notes', err);
                }
                if (!notes.length) {
                    res.status(404).send({
                        success: false,
                        error: `Notes from user "${_id}" not found`
                    });
                    return;
                }
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
    },
    createAccount: (req, res) => {
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
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${_id}" not found`
                });
                return;
            }
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
    },
    editAccount: (req, res) => {
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
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${_id}" not found`
                });
                return;
            }
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
    },
    editPassword: (req, res) => {
        const { _id, password } = req.body;
        User.findOne({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${_id}" not found`
                });
                return;
            }
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
    },
    deleteAccount: (req, res) => {
        const { _id } = req.body;
        User.findOneAndDelete({ _id }, (err, user) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    err
                });
                return console.error('error finding user', err);
            }
            if (!user) {
                res.status(404).send({
                    success: false,
                    error: `User "${_id}" not found`
                });
                return;
            }
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
    }
}