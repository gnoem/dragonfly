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
            Note.find({ userId: id }, (err, notes) => {
                if (err) return console.error('error finding notes');
                res.send({
                    success: true,
                    user,
                    notes
                });
            });
        });
    });
}