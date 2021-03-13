import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Note, Collection, Tag } from '../models/index.js';

const secretKey = process.env.SECRET_KEY;

// utils
const handle = (promise) => {
    return promise
        .then(data => ([data, undefined]))
        .catch(err => Promise.resolve([undefined, err]));
}
const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && (new mongoose.Types.ObjectId(id)).toString() === id;

class Controller {
    auth = (req, res) => {
        const { identifier } = req.params;
        const accessToken = req.cookies?.auth;
        const run = async () => {
            // determine if identifier is username or _id
            if (isObjectId(identifier)) {
                const [user, findUserError] = await handle(User.findOne({ _id: identifier }));
                // (just because it's a valid objectID doesn't mean it's a dragonfly user)
                if (findUserError) throw new Error(`Error finding user ${identifier}`);
                if (!user) throw new Error(`User ${identifier} not found`);
                if (user.username) return res.send({ redirect: user.username });
                return res.send({ success: true }); // not password protected
            }
            // if not, then identifier is a username
            if (!accessToken) return res.send({ success: false, accessToken: false });
            const decoded = jwt.verify(accessToken, secretKey);
            const [protectedUser, findProtectedUserError] = await handle(User.findOne({ username: identifier }));
            if (findProtectedUserError) throw new Error(`Error finding user ${identifier}`);
            if (!protectedUser) throw new Error(`User ${identifier} not found`); // and delete cookie? todo figure out
            if (protectedUser._id.toString() !== decoded.id) return res.send({ success: false });
            res.send({ success: true });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    login = (req, res) => {
        const { username } = req.params;
        const { password } = req.body;
        const run = async () => {
            const [user, findUserError] = await handle(User.findOne({ username }));
            if (findUserError) throw new Error(`Error finding user ${username}`);
            if (!user) throw new Error(`User ${username} not found`);
            const passwordIsValid = bcrypt.compareSync(password, user.password);
            if (!passwordIsValid) throw new Error(`Invalid password`);
            const accessToken = jwt.sign({ id: user._id }, secretKey, { expiresIn: 86400 }); // 24 hours
            res.cookie('auth', accessToken, { httpOnly: true, secure: false, maxAge: 3600000 });
            res.status(200).send({ success: true, accessToken });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    logout = (req, res) => {
        res.clearCookie('auth');
        res.send({ success: true });
    }
    getUser = (req, res) => {
        const { identifier } = req.params;
        const searchingById = isObjectId(identifier);
        const searchParams = searchingById ? { _id: identifier } : { username: identifier };
        const run = async () => {
            const [user, findUserError] = await handle(User.findOne(searchParams));
            if (findUserError) throw new Error(`Error finding user ${searchParams}`);
            if (!user) throw new Error(`User ${searchParams} not found`);
            const userId = user._id;
            const [foundData, findDataError] = await handle(Promise.all([
                Note.find({ userId }).lean().sort({ lastModified: 'desc' }),
                Collection.find({ userId }),
                Tag.find({ userId })
            ]));
            if (findDataError) throw new Error(`Error retrieving data from user ${identifier}`);
            const [foundNotes, collections, tags] = foundData;
            const notes = foundNotes.map(note => Object.assign(note, { content: JSON.parse(note.content) }));
            res.status(200).send({ success: true, data: { user, notes, collections, tags } });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    createUser = (req, res) => {
        const run = async () => {
            const [user, createUserError] = await handle(User.create());
            if (createUserError) throw new Error(`Error creating new user`);
            res.status(200).send({ success: true, user });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    createAccount = (req, res) => {
        const { _id } = req.params;
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
        const { firstName, lastName, email, username, password } = req.body;
        const run = async () => {
            let [foundUser, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new Error(`Error finding user ${_id}`);
            if (!foundUser) throw new Error(`User ${_id} not found`);
            const formData = {
                firstName,
                lastName,
                email,
                username,
                password: bcrypt.hashSync(password, 8)
            };
            foundUser = Object.assign(foundUser, formData);
            const [user, saveError] = await handle(foundUser.save());
            if (saveError) throw new Error(`Error saving user ${_id}`);
            res.send({ success: true, user });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editAccount = (req, res) => {
        const { _id } = req.params;
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
        const { firstName, lastName, email, username } = req.body;
        const run = async () => {
            let [foundUser, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new Error(`Error finding user ${_id}`);
            if (!foundUser) throw new Error(`User ${_id} not found`);
            foundUser = Object.assign(foundUser, { firstName, lastName, email, username });
            const [user, saveError] = await handle(foundUser.save());
            if (saveError) throw new Error(`Error saving user ${_id}`);
            res.send({ success: true, user });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editPassword = (req, res) => {
        const { _id } = req.params;
        const { password } = req.body;
        const run = async () => {
            let [foundUser, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new Error(`Error finding user ${_id}`);
            if (!foundUser) throw new Error(`User ${_id} not found`);
            foundUser = Object.assign(foundUser, { password: bcrypt.hashSync(password, 8) });
            const [user, saveError] = await handle(foundUser.save());
            if (saveError) throw new Error(`Error saving user ${_id}`);
            res.send({ success: true, user });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    deleteAccount = (req, res) => {
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
    createNote = (req, res) => {
        const { id, title, content } = req.body;
        const run = async () => {
            const newNote = {
                userId: id,
                title,
                content: JSON.stringify(content),
                createdAt: Date.now(),
                lastModified: Date.now()
            };
            const [note, createNoteError] = await handle(Note.create(newNote));
            if (createNoteError) throw new Error(`Error creating new note`);
            res.status(200).send({ success: true, note });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editNote = (req, res) => {
        const { _id, action } = req.params;
        const run = async () => {
            let [foundNote, findNoteError] = await handle(Note.findOne({ _id }));
            if (findNoteError) throw new Error(`Error finding note ${_id}`);
            if (!foundNote) throw new Error(`Note ${_id} not found`);
            const dispatch = (() => {
                switch (action) {
                    case 'content': return this.editNoteContent;
                    case 'star': return this.starNote;
                    case 'collection': return this.moveNoteToCollection;
                    case 'tag': return this.tagNote;
                    case 'trash': return this.trashNote;
                    default: throw new Error(`Invalid action: ${action}`);
                }
            })();
            const [editedNote, editNoteError] = await handle(dispatch(foundNote, req.body));
            if (editNoteError) throw new Error(`Dispatch error`);
            const [note, saveError] = await handle(editedNote.save());
            if (saveError) throw new Error(`Error saving note ${_id}`);
            res.send({ success: true, note });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editNoteContent = async (foundNote, { title, content }) => {
        return Object.assign(foundNote, {
            title,
            content: JSON.stringify(content),
            lastModified: Date.now()
        });
    }
    starNote = async (foundNote) => {
        return Object.assign(foundNote, { starred: !foundNote.starred });
    }
    moveNoteToCollection = async (foundNote, { collectionId }) => {
        return Object.assign(foundNote, { collectionId });
    }
    tagNote = async (foundNote, { tagId }) => {
        const noteAlreadyHasTag = foundNote.tags && (foundNote.tags.indexOf(tagId) !== -1);
        if (noteAlreadyHasTag) {
            const index = foundNote.tags.indexOf(tagId);
            foundNote.tags.splice(index, 1);
        } else foundNote.tags.push(tagId);
        return foundNote;
    }
    trashNote = async (foundNote) => {
        return Object.assign(foundNote, { trash: !foundNote.trash });
    }
    deleteNote = (req, res) => {
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
    }
    emptyTrash = (req, res) => {
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
    }
    createCollection = (req, res) => {
        const errors = validationResult(req); // todo add collectionAlreadyExists to validation
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
        const { userId, name } = req.body;
        const run = async () => {
            const [collection, createCollectionError] = await handle(Collection.create({ userId, name }));
            if (createCollectionError) throw new Error(`Error creating collection`);
            res.send({ success: true, collection });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editCollection = (req, res) => {
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
        const { _id } = req.params;
        const { name } = req.body;
        const run = async () => {
            let [foundCollection, findCollectionError] = await handle(Collection.findOne({ _id }));
            if (findCollectionError) throw new Error(`Error finding collection ${_id}`);
            if (!foundCollection) throw new Error(`Collection ${_id} not found`);
            foundCollection = Object.assign(foundCollection, { name });
            const [collection, saveError] = await handle(foundCollection.save());
            if (saveError) throw new Error(`Error saving collection ${_id}`);
            res.send({ success: true, collection });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    deleteCollection = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [collection, findCollectionError] = await handle(Collection.findOne({ _id }));
            if (findCollectionError) throw new Error(`Error finding collection ${_id}`);
            if (!collection) throw new Error(`Collection ${_id} not found`);
            const [notesInCollection, findNotesError] = await handle(Note.find({ collectionId: _id }));
            if (findNotesError) throw new Error(`Error finding notes in this collection`);
            const removeCollectionFromNotes = notesInCollection.map(note => {
                note.collectionId = null;
                return note.save();
            });
            const [success, error] = await handle(Promise.all([
                collection.deleteOne(),
                ...removeCollectionFromNotes
            ]));
            if (error) throw new Error(`Error deleting this collection`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    createTag = (req, res) => {
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
        const { userId, name } = req.body;
        const run = async () => {
            const [tag, createTagError] = await handle(Tag.create({ userId, name }));
            if (createTagError) throw new Error(`Error creating tag`);
            res.send({ success: true, tag });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editTag = (req, res) => {
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
        const { _id } = req.params;
        const { name } = req.body;
        const run = async () => {
            const [foundTag, findTagError] = await handle(Tag.findOne({ _id }));
            if (findTagError) throw new Error(`Error finding tag ${_id}`);
            if (!foundTag) throw new Error(`Tag ${_id} not found`);
            foundTag = Object.assign(foundTag, { name });
            const [tag, saveError] = await handle(foundTag.save());
            if (saveError) throw new Error(`Error saving tag ${_id}`);
            res.send({ success: true, tag });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    deleteTag = (req, res) => {
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
                        if (noteHasTag) {
                            thisNotesTags.splice(tagIndex, 1);
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
    }
}

export default new Controller();