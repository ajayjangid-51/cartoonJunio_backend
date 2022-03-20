const User = require('../../models/login/users');
const {object} = require('../../models/admin/object');
const ObjectId = require('mongodb').ObjectId;

//set collection inGrid to true if user scanned or found object
const addScannedObject = async (req, res) => {
    var id = req.body.id;
    var userId = new ObjectId(id);

    User.users.findOne({ _id: userId }, async function (err, foundUser) {
        if (err) {
            res.status(301).json({ message: 'Error' });
        } else {
            for (var i = 0; i < foundUser.currentGrid.length; i++) {
                if (foundUser.currentGrid[i].objectId == req.body.objectId) {
                    foundUser.currentGrid[i].inGrid = req.body.inGrid;
                    let response = await foundUser.save();
                    console.log('found object id');
                    break;
                }
            }
            res.status(200).json({ message: 'ok', data: "in Grid value updated" });
        }
    });
}

//assign 24 object to user from pool of objects
const assignGrid = async (req, res) => {
    
    // assign new grid to user
    object.find({}, async (err, foundObjects) => {
        if (err) {
            console.log({ message: "error: objects not found" });
            res.status(404).send({ message: "error: objects not found" });
        } else {

            const shuffledGrid = foundObjects.sort(() => 0.5 - Math.random());
            let selectedGrid = shuffledGrid.slice(0, 24);

            User.users.findOne({ uid: req.authId.uid }, async function (err, foundUser) {
                if (err || !foundUser) {
                    // res.send({ message: "Error" })
                    console.log({ message: "Error: user not found" })
                    res.status(404).send({ message: "Error: user not found" })
                } else {
                    function addGridObject(item) {
                        let collection = new User.currentGrids({
                            objectId: item._id,
                            imageURL: item.imageURL,
                            objectName: item.objectName,
                            _3dModelURL: item._3dModelURL
                        });

                        foundUser.currentGrid.push(collection);
                    };
                    selectedGrid.forEach(addGridObject);

                    let response = await foundUser.save();
                    // console.log('response: ',response);


                    // res.send({ message: 'Grid assgined successfully'})
                    
                    res.send({ message: 'Grid assigned successfully' })
                    
                    // res.send({ message: 'Grid assgined successfully'})

                }
            });
        }
    });
}



module.exports = {
    addScannedObject,
    assignGrid
};
