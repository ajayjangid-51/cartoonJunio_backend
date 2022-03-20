const User = require('../../models/login/users');
const ObjectId = require('mongodb').ObjectId;

const tradeObject = async (req, res) => {

    var userId = new ObjectId(req.body.senderId);
    var recieverId = new ObjectId(req.body.recieverId);
    
    User.users.findOne({ _id: userId}, async function (err, foundUser) {
        
        if (err) {
            res.status(301).json({ message: 'error' });
        } else {
            //console.log(foundUser);
            for (var i = 0; i < foundUser.collectionsOfObject.length; i++) {

                if (foundUser.collectionsOfObject[i].objectId == req.body.objectId) {

                    if (req.body.numberOfObject > foundUser.collectionsOfObject[i].count) {

                        res.status(301).json({ message: 'error', data: "given number of object are not available in your collections" });
                    } else {

                        foundUser.collectionsOfObject[i].count -= req.body.numberOfObject;
                        let response = await foundUser.save();

                        User.users.findOne({_id: recieverId}, async function(err, User1){
                            if(err || !User1){
                                res.status(301).json({ message: 'error' });
                            }else{
                                User1.collectionsOfObject[i].count+= req.body.numberOfObject;
                                let response = await User1.save();
                             }
                        })
                        res.status(200).json({ message: 'success', data: "Traded succesfully" });
                    }
                    break;
                }
            }
        }
    });

   
}

module.exports = {
    tradeObject
}