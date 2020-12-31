const User = require('../models/user');
const Note = require('../models/note');

module.exports = (app) => {
    app.post('/create/user', (req, res) => {
        const newUser = new User();
        newUser.save(err => {
            if (err) return console.error('error saving new user', err);
            res.send({
                success: true,
                user: newUser
            });
        });
    });
    app.post('/get/data', (req, res) => {
        const { id } = req.body;
        User.findOne({ _id: id }, (err, user) => {
            if (err) return console.error('error finding user', err);
            if (!user) return console.log(`user ${id} not found`);
            Note.find({ userId: id }).sort({ lastModified: 'desc' }).exec((err, notes) => {
                if (err) return console.error('error finding notes');
                let preparedNotes = [];
                for (let i = 0; i < notes.length; i++) {
                    const { _id, userId, title, content, tags, collections, createdAt, lastModified } = notes[i];
                    preparedNotes.push({
                        _id, userId, title, content: JSON.parse(content), tags, collections, createdAt, lastModified
                    });
                }
                res.send({
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
            content: JSON.stringify(content)
        });
        newNote.save(err => {
            if (err) return console.error('error saving note', err);
            console.log('success!');
            res.send({
                success: true,
                id: newNote._id
            });
        });
    });
    app.post('/edit/note', (req, res) => {
        const { id, title, content } = req.body;
        Note.findOne({ _id: id }, (err, note) => {
            if (err) return console.error('error finding note', err);
            if (!note) return console.log(`note ${id} not found`);
            note.title = title;
            note.content = JSON.stringify(content);
            note.lastModified = Date.now();
            note.save(err => {
                if (err) return console.error('error saving note', err);
                console.log('successfully edited note');
                res.send({
                    success: true
                });
            });
        });
    });
    app.post('/delete/note', (req, res) => {
        const { id } = req.body;
        Note.findOneAndDelete({ _id: id }, (err, note) => {
            if (err) return console.error('error finding note', err);
            if (!note) return console.log(`note ${id} not found`);
            console.log('deleting note');
            res.send({
                success: true
            });
        })
    })
}