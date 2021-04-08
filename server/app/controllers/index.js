import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 } from 'uuid';
import { User, Note, Collection, Tag, Token } from '../models/index.js';
import { sendPasswordResetEmail } from './email/index.js';
import { handle, isObjectId, ServerError, formErrorReport } from './utils.js';

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
                if (findUserError) throw new ServerError(500, `Error finding user`, findUserError);
                if (!user) throw new ServerError(404, `User not found`);
                if (user.username) return res.status(307).send({ _id: user._id, username: user.username });
                return res.status(200).send({ token: true, _id: identifier }); // not password protected
            }
            // if not, then identifier is a username
            const [protectedUser, findProtectedUserError] = await handle(User.findOne({ username: identifier }));
            if (findProtectedUserError) throw new ServerError(500, `Error finding user`, findProtectedUserError);
            if (!protectedUser) throw new ServerError(404, `User not found`); // and delete cookie? todo figure out
            if (!accessToken) return res.status(401).send({ token: false, _id: protectedUser._id });
            const decoded = jwt.verify(accessToken, secretKey);
            if (protectedUser._id.toString() !== decoded.id) return res.status(401).send({ token: false, _id: protectedUser._id });
            res.status(200).send({ token: true, _id: protectedUser._id });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    storeLoginCookie = (res, user) => {
        const accessToken = jwt.sign({ id: user.id }, secretKey, {
            expiresIn: 86400 // 24 hours
        });
        res.cookie('auth', accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000 // 1,000 hours
        });
    }
    login = (req, res) => {
        const { username } = req.params;
        const { password } = req.body;
        const run = async () => {
            const [user, findUserError] = await handle(User.findOne({ username }));
            if (findUserError) throw new ServerError(500, `Error finding user`, findUserError);
            if (!user) throw new ServerError(500, `User not found`);
            const passwordIsValid = bcrypt.compareSync(password, user.password);
            if (!passwordIsValid) return res.status(422).send({ error: { password: 'Invalid password' } });
            this.storeLoginCookie(res, user);
            res.status(204).end();
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    logout = (req, res) => {
        res.clearCookie('auth');
        res.status(200).send({ success: true });
    }
    getUser = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [user, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new ServerError(500, `Error finding user`, findUserError);
            if (!user) throw new ServerError(500, `User ${_id} not found`);
            const userId = _id;
            const [foundData, findDataError] = await handle(Promise.all([
                Note.find({ userId }).lean().sort({ lastModified: 'desc' }),
                Collection.find({ userId }),
                Tag.find({ userId })
            ]));
            if (findDataError) throw new ServerError(500, `Error retrieving data`, findDataError);
            const [foundNotes, collections, tags] = foundData;
            const notes = foundNotes.map(note => Object.assign(note, { content: JSON.parse(note.content) }));
            res.status(200).send({ data: { user, notes, collections, tags } });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    createUser = (req, res) => {
        const run = async () => {
            const newUser = new User();
            const [user, saveUserError] = await handle(newUser.save());
            if (saveUserError) throw new ServerError(500, `Error saving new user`, saveUserError);
            res.status(201).send({ user });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    createAccount = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: formErrorReport(errors) });
        const { _id } = req.params;
        const { firstName, lastName, email, username, password } = req.body;
        const run = async () => {
            let [foundUser, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new ServerError(500, `Error retrieving user`, findUserError);
            if (!foundUser) throw new ServerError(500, `User not found`);
            const formData = {
                firstName,
                lastName,
                email,
                username,
                password: bcrypt.hashSync(password, 8)
            };
            foundUser = Object.assign(foundUser, formData);
            const [user, saveError] = await handle(foundUser.save());
            if (saveError) throw new ServerError(500, `Error saving user`, saveError);
            this.storeLoginCookie(res, user);
            res.status(201).send({ user });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editAccount = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: formErrorReport(errors) });
        const { _id } = req.params;
        const formData = req.body;
        const run = async () => {
            let [foundUser, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new ServerError(500, `Error retrieving user`, findUserError);
            if (!foundUser) throw new ServerError(500, `User not found`);
            foundUser = Object.assign(foundUser, formData);
            const [user, saveError] = await handle(foundUser.save());
            if (saveError) throw new ServerError(500, `Error saving user`, saveError);
            res.status(200).send({ user });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editPassword = (req, res) => {
        const { _id } = req.params;
        const { reset, password } = req.body;
        const run = async () => {
            let [foundUser, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new ServerError(500, `Error retrieving user`, findUserError);
            if (!foundUser) throw new ServerError(500, `User not found`);
            foundUser = Object.assign(foundUser, { password: bcrypt.hashSync(password, 8) });
            const [user, saveError] = await handle(foundUser.save());
            if (saveError) throw new ServerError(500, `Error saving user`, saveError);
            if (reset) {
                this.storeLoginCookie(res, user);
                const [foundToken, _] = await handle(Token.findOne({ userId: user._id }));
                if (foundToken) await foundToken.deleteOne();
            }
            res.status(200).send({ user });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    deleteAccount = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [user, findUserError] = await handle(User.findOne({ _id }));
            if (findUserError) throw new ServerError(500, `Error retrieving user`, findUserError);
            if (!user) throw new ServerError(500, `User not found`);
            const [_, findAndDeleteError] = await handle(Promise.all([
                user.deleteOne(),
                Note.deleteMany({ userId: _id }),
                Collection.deleteMany({ userId: _id }),
                Tag.deleteMany({ userId: _id })
            ]));
            if (findAndDeleteError) throw new ServerError(500, `Error deleting user`, saveError);
            res.status(204).end();
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    resetPassword = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: formErrorReport(errors) });
        const { email } = req.body;
        const run = async () => {
            const [foundUser, findUserError] = await handle(User.findOne({ email }));
            if (findUserError) throw new ServerError(500, `Error finding user`, findUserError);
            if (!foundUser) return res.status(422).send({ error: { email: `No user with this email address in our system` } });
            const token = v4().toString().replace(/-/g, '');
            const [_, updateTokenError] = await handle(Token.updateOne(
                { userId: foundUser._id },
                { userId: foundUser._id, token },
                { upsert: true }
            ));
            if (updateTokenError) throw new ServerError(500, `Error generating password reset token`, updateTokenError);
            const resetLink = `${process.env.DOMAIN}/recover/${token}`;
            const [sentEmail, sendEmailError] = await handle(sendPasswordResetEmail({
                to: email,
                subject: 'Your Dragonfly account',
                resetLink
            }));
            if (sendEmailError) throw new ServerError(500, `Error sending email`, sendEmailError);
            console.log(sentEmail);
            res.status(204).end();
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    validateToken = (req, res) => {
        const { token } = req.params;
        const run = async () => {
            const [foundToken, findTokenError] = await handle(Token.findOne({ token }));
            if (findTokenError) throw new ServerError(500, `Error finding token`, findTokenError);
            res.status(200).send({ isValid: !!foundToken, userId: foundToken?.userId });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
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
            if (createNoteError) throw new ServerError(500, `Error creating new note`, createNoteError);
            res.status(201).send({ note });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editNote = (req, res) => {
        const { _id, action } = req.params;
        const run = async () => {
            let [foundNote, findNoteError] = await handle(Note.findOne({ _id }));
            if (findNoteError) throw new ServerError(500, `Error finding note`, findNoteError);
            if (!foundNote) throw new ServerError(500, `Note not found`);
            const dispatch = (() => {
                switch (action) {
                    case 'content': return this.editNoteContent;
                    case 'star': return this.starNote;
                    case 'collection': return this.moveNoteToCollection;
                    case 'tag': return this.tagNote;
                    case 'trash': return this.trashNote;
                    default: throw new ServerError(500, `Invalid action: ${action}`);
                }
            })();
            const [editedNote, editNoteError] = await handle(dispatch(foundNote, req.body));
            if (editNoteError) throw new ServerError(500, `Dispatch error for ${action}`, editNoteError);
            const [note, saveError] = await handle(editedNote.save());
            if (saveError) throw new ServerError(500, `Error saving note`, saveError);
            res.status(200).send({ note });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
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
            const [_, deleteNoteError] = await handle(Note.findOneAndDelete({ _id }));
            if (deleteNoteError) throw new ServerError(500, `Error deleting note`, deleteNoteError);
            res.status(204).end();
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    emptyTrash = (req, res) => {
        const { userId } = req.params;
        const run = async () => {
            const [_, deleteNotesError] = await handle(Note.deleteMany({ userId, trash: true }));
            if (deleteNotesError) throw new ServerError(500, `Error deleting notes`, deleteNotesError);
            res.status(204).end();
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    restoreTrash = (req, res) => {
        const { userId } = req.params;
        const run = async () => {
            const [notes, findNotesError] = await handle(Note.find({ userId, trash: true }));
            if (findNotesError) throw new ServerError(500, `Error finding notes`, findNotesError);
            const restoreNotes = notes.map(note => {
                note.trash = false;
                return note.save();
            });
            const [restoredNotes, saveNotesError] = await handle(Promise.all(restoreNotes));
            if (saveNotesError) throw new ServerError(500, `Error saving notes`, saveNotesError);
            res.status(200).send({ notes: restoredNotes });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    createCollection = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: formErrorReport(errors) });
        const { userId, name } = req.body;
        const run = async () => {
            const [collection, createCollectionError] = await handle(Collection.create({ userId, name }));
            if (createCollectionError) throw new ServerError(500, `Error creating collection`, createCollectionError);
            res.status(201).send({ collection });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editCollection = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: formErrorReport(errors) });
        const { _id } = req.params;
        const { name } = req.body;
        const run = async () => {
            let [foundCollection, findCollectionError] = await handle(Collection.findOne({ _id }));
            if (findCollectionError) throw new ServerError(500, `Error finding collection`, findCollectionError);
            if (!foundCollection) throw new ServerError(500, `Collection not found`);
            foundCollection = Object.assign(foundCollection, { name });
            const [collection, saveError] = await handle(foundCollection.save());
            if (saveError) throw new ServerError(500, `Error saving collection`, saveError);
            res.status(200).send({ collection });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    deleteCollection = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [collection, findCollectionError] = await handle(Collection.findOne({ _id }));
            if (findCollectionError) throw new ServerError(500, `Error finding collection`, findCollectionError);
            if (!collection) throw new ServerError(500, `Collection not found`);
            const [notesInCollection, findNotesError] = await handle(Note.find({ collectionId: _id }));
            if (findNotesError) throw new ServerError(500, `Error finding notes`, findNotesError);
            const removeCollectionFromNotes = notesInCollection.map(note => {
                note.collectionId = null;
                return note.save();
            });
            const [_, error] = await handle(Promise.all([
                collection.deleteOne(),
                ...removeCollectionFromNotes
            ]));
            if (error) throw new ServerError(500, `Error deleting collection`, error);
            res.status(204).end();
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    createTag = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: formErrorReport(errors) });
        const { userId, name } = req.body;
        const run = async () => {
            const [tag, createTagError] = await handle(Tag.create({ userId, name }));
            if (createTagError) throw new ServerError(500, `Error creating tag`, createTagError);
            res.status(201).send({ tag });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editTag = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: formErrorReport(errors) });
        const { _id } = req.params;
        const { name } = req.body;
        const run = async () => {
            let [foundTag, findTagError] = await handle(Tag.findOne({ _id }));
            if (findTagError) throw new ServerError(500, `Error finding tag`, findTagError);
            if (!foundTag) throw new ServerError(500, `Tag not found`);
            foundTag = Object.assign(foundTag, { name });
            const [tag, saveError] = await handle(foundTag.save());
            if (saveError) throw new ServerError(500, `Error saving tag`, saveError);
            res.status(200).send({ tag });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
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
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
}

export default new Controller();