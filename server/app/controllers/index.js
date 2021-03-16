import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Note, Collection, Tag } from '../models/index.js';
import { handle, isObjectId, FormError, validationError } from './utils.js';

const secretKey = process.env.SECRET_KEY;

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
                if (user.username) return res.send({ _id: user._id, username: user.username });
                return res.status(200).send({ success: true, _id: identifier }); // not password protected
            }
            // if not, then identifier is a username
            const [protectedUser, findProtectedUserError] = await handle(User.findOne({ username: identifier }));
            if (findProtectedUserError) throw new Error(`Error finding user ${identifier}`);
            if (!protectedUser) throw new Error(`User ${identifier} not found`); // and delete cookie? todo figure out
            if (!accessToken) return res.send({ success: false, accessToken: false, _id: protectedUser._id });
            const decoded = jwt.verify(accessToken, secretKey);
            if (protectedUser._id.toString() !== decoded.id) return res.send({ success: false, _id: protectedUser._id });
            res.status(200).send({ success: true, _id: protectedUser._id });
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
        res.status(200).send({ success: true });
    }
    getUser = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [user, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new Error(`Error finding user ${_id}`);
            if (!user) throw new Error(`User ${_id} not found`);
            const userId = _id;
            const [foundData, findDataError] = await handle(Promise.all([
                Note.find({ userId }).lean().sort({ lastModified: 'desc' }),
                Collection.find({ userId }),
                Tag.find({ userId })
            ]));
            if (findDataError) throw new Error(`Error retrieving data from user ${_id}`);
            const [foundNotes, collections, tags] = foundData;
            const notes = foundNotes.map(note => Object.assign(note, { content: JSON.parse(note.content) }));
            res.status(200).send({ success: true, data: { user, notes, collections, tags } });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    createUser = (req, res) => {
        const run = async () => {
            const newUser = new User();
            const [user, saveUserError] = await handle(newUser.save());
            if (saveUserError) throw new Error(`Error saving new user`);
            res.status(200).send({ success: true, user });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    createAccount = (req, res) => {
        const { _id } = req.params;
        const { errors } = validationResult(req);
        if (errors.length) return res.send({ success: false, error: validationError(errors) });
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
            res.status(200).send({ success: true, user });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editAccount = (req, res) => {
        const { _id } = req.params;
        const { errors } = validationResult(req);
        if (errors.length) return res.send({ success: false, error: validationError(errors) });
        const formData = req.body;
        const run = async () => {
            let [foundUser, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new Error(`Error finding user ${_id}`);
            if (!foundUser) throw new Error(`User ${_id} not found`);
            foundUser = Object.assign(foundUser, formData);
            const [user, saveError] = await handle(foundUser.save());
            if (saveError) throw new Error(`Error saving user ${_id}`);
            res.status(200).send({ success: true, user });
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
            res.status(200).send({ success: true, user });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    deleteAccount = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [user, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new Error(`Error finding user ${_id}`);
            if (!user) throw new Error(`User ${_id} not found`);
            const [data, findAndDeleteError] = await handle(Promise.all([
                user.deleteOne(),
                Note.deleteMany({ userId: _id }),
                Collection.deleteMany({ userId: _id }),
                Tag.deleteMany({ userId: _id })
            ]));
            if (findAndDeleteError) throw new Error(`Error deleting data associated with user ${_id}`);
            res.status(200).send({ success: true, deleted: [...data] });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    createNote = (req, res) => {
        const { userId, title, content } = req.body;
        const run = async () => {
            const newNote = {
                userId,
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
            res.status(200).send({ success: true, note });
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
        const { _id } = req.params;
        const run = async () => {
            const [note, deleteNoteError] = await handle(Note.findOneAndDelete({ _id }));
            if (deleteNoteError) throw new Error(`Error deleting note ${_id}`);
            res.status(200).send({ success: true, note });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    emptyTrash = (req, res) => {
        const { userId } = req.params;
        const run = async () => {
            const [notes, deleteNotesError] = await handle(Note.deleteMany({ userId, trash: true }));
            if (deleteNotesError) throw new Error(`Error deleting notes`);
            res.status(200).send({ success: true, notes });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    restoreTrash = (req, res) => {
        const { userId } = req.params;
        const run = async () => {
            const [notes, findNotesError] = await handle(Note.find({ userId, trash: true }));
            if (findNotesError) throw new Error(`Error finding notes`);
            const restoreNotes = notes.map(note => {
                note.trash = false;
                return note.save();
            });
            const [restoredNotes, saveNotesError] = await handle(Promise.all(restoreNotes));
            if (saveNotesError) throw new Error(`Error saving notes`);
            res.status(200).send({ success: true, notes: restoredNotes });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    createCollection = (req, res) => {
        const { errors } = validationResult(req); // todo add collectionAlreadyExists to validation
        if (errors.length) return res.send({ success: false, error: validationError(errors) });
        const { userId, name } = req.body;
        const run = async () => {
            const [collection, createCollectionError] = await handle(Collection.create({ userId, name }));
            if (createCollectionError) throw new Error(`Error creating collection`);
            res.status(200).send({ success: true, collection });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editCollection = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.send({ success: false, error: validationError(errors) });
        const { _id } = req.params;
        const { name } = req.body;
        const run = async () => {
            let [foundCollection, findCollectionError] = await handle(Collection.findOne({ _id }));
            if (findCollectionError) throw new Error(`Error finding collection ${_id}`);
            if (!foundCollection) throw new Error(`Collection ${_id} not found`);
            foundCollection = Object.assign(foundCollection, { name });
            const [collection, saveError] = await handle(foundCollection.save());
            if (saveError) throw new Error(`Error saving collection ${_id}`);
            res.status(200).send({ success: true, collection });
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
            if (error) throw new Error(`Error deleting this collection and associated notes`);
            res.status(200).send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    createTag = (req, res) => {
        const { errors } = validationResult(req);
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
            res.status(200).send({ success: true, tag });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editTag = (req, res) => {
        const { errors } = validationResult(req);
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
            let [foundTag, findTagError] = await handle(Tag.findOne({ _id }));
            if (findTagError) throw new Error(`Error finding tag ${_id}`);
            if (!foundTag) throw new Error(`Tag ${_id} not found`);
            foundTag = Object.assign(foundTag, { name });
            const [tag, saveError] = await handle(foundTag.save());
            if (saveError) throw new Error(`Error saving tag ${_id}`);
            res.status(200).send({ success: true, tag });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    deleteTag = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [tag, findTagError] = await handle(Tag.findOne({ _id }));
            if (findTagError) throw new Error(`Error finding tag ${_id}`);
            if (!tag) throw new Error(`Tag ${_id} not found`);
            const [allUsersNotes, findNotesError] = await handle(Note.find({ userId: tag.userId }));
            if (findNotesError) throw new Error(`Error finding notes from user ${userId}`);
            // loop through notes and see which ones have this tag
            const updateNotesWithThisTag = allUsersNotes.map(note => {
                const index = note.tags.indexOf(_id);
                if (index !== -1) {
                    note.tags.splice(index, 1);
                    return note.save();
                }
            })
            const [success, error] = await handle(Promise.all([
                tag.deleteOne(),
                ...updateNotesWithThisTag
            ]));
            if (error) throw new Error(`Error deleting this tag and associated notes`);
            res.status(200).send({ success: true, tag: success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
}

export default new Controller();