const User = require('../../models/login/users');
const ObjectId = require('mongodb').ObjectId;

const searchUser = async (req, res) => {
    var id = req.body.id;
    var userId = new ObjectId(id);

    User.users.findOne({ _id: userId }, async function (err, foundUser) {
        if (err) {
            res.status(301).json({ message: 'error' });
        } else {
            //console.log(foundUser);
            res.status(200).json({ message: 'success' , data: "User found", userName: foundUser.userName});
        }
    });
};

module.exports = {
    searchUser
};
