const User = require('../../models/login/users');
const ObjectId = require('mongodb').ObjectId;
const { pin } = require('../../models/admin/object');
const { session } = require('../../config/neo4j')
const { object } = require('../../models/admin/object');

const updateUserCollection = async (req, res) => {

    var id = req.body.id;
    var userId = new ObjectId(id);
    //var objectID = new ObjectId(req.body.objectId);

    User.users.findOne({ _id: userId }, async (err, foundCollection) => {
        if (err || !foundCollection) {
            res.status(301).json({ message: 'error' });
        } else {

            if (req.body.count == 1) {

                const updateResult = await User.users.findOneAndUpdate(
                    {
                        _id: userId,
                        'collectionsOfObject.objectName': req.body.objectName
                    },
                    {
                        $inc: {
                            'collectionsOfObject.$.count': 1
                        },
                        $push: {
                            'collectionsOfObject.$.locationId': { Id: req.body.locationId },
                            'collectedPins': { Id: req.body.locationId }
                        }
                    }
                );

            } else {
                //decrement count of object
            }
        }
        res.status(200).json({ message: 'success', data: "user object updated" });
    })
}



const collectCard = async (req, res) => {

    // body = {
    // objectName:
    // locationId:
    // }
    User.users.findOne({ uid: req.authId.uid }, async function (err, foundCollection) {
        if (err || !foundCollection) {
            res.status(301).json({ message: 'error' });
        } else {

            const findPin = await session.run(
                'MATCH (u:User {_id: $_id}) \
                 MATCH (p: Pins {_id: $locationId}) \
                 RETURN EXISTS((u) - [:COLLECTED] -> (p)) ',
                {
                    _id: req.authId.uid,
                    locationId: req.body.locationId 
                }
            );
            const findLocationPin = findPin.records[0]._fields[0];

            if (findLocationPin) {
                //if pin already exist in collectedPins
                res.send({ message: "error", data: "pin already collected" });

            } else {

                const createRelation = await session.run(
                    `MATCH(u: User { _id: $_id}) \
                    MATCH(p: Pins { _id: $locationId }) \
                    CREATE (u) - [: COLLECTED] -> (p) \
                    return p`,
                    {
                        _id: req.authId.uid,
                        locationId: req.body.locationId 
                    }
                )
                const allPins = createRelation.records.map(i => i.get('p').properties);
                //collected Pin information
                const collectedPin = allPins[0];


                // console.log("notCollectedPins.initlength", foundCollection.notCollectedPins.length);
                // console.log("collectedPins.initlength", foundCollection.collectedPins.length);

                // let updateStatus = await User.users.findOneAndUpdate({ $and: [{ _id: req.body.id }, { "collectionsOfObject.objectName": req.body.objectName }] },
                let updateStatus = await User.users.findOneAndUpdate({ $and: [{ uid: req.authId.uid }, { "collectionsOfObject.objectName": req.body.objectName }] },
                    {
                        $inc: { "collectionsOfObject.$.count": 1 },
                        $push: {
                            "collectionsOfObject.$.locationId": { Id: req.body.locationId },
                            // collectedPins: { Id: req.body.locationId },
                        }
                    },
                    {
                        new: true,
                        upsert: false,
                        rawResult: true // Return the raw result from the MongoDB driver
                    }
                );


                if (updateStatus.lastErrorObject.n > 0) {
                    // console.log("notCollectedPins.finallength", updateStatus.value.notCollectedPins.length);
                    // console.log("collectedPins.finallength", updateStatus.value.collectedPins.length);
                    // console.log(updateStatus.lastErrorObject);
                    let updatedObject = updateStatus.value.collectionsOfObject.find((card) => card.objectName === req.body.objectName);
                    // console.log(updatedObject);
                    // console.log(updateStatus2.lastErrorObject);
                    res.status(200).send({ message: 'success', data: updatedObject });

                    // if object is not present in user's collection, push new
                } else {

                    //console.log("not updated: inserting new one");
                    // let collectedPin = await pin.findById(req.body.locationId)
                    // // console.log(collectedPin);
                    let collection = new User.collectionsOfObjects({
                        imageURL: collectedPin.imageURL,
                        objectName: collectedPin.objectName,
                        _3dModelURL: collectedPin._3dModelURL,
                        count: 1,
                        locationId: [{ Id: collectedPin._id }]
                    });
                    // // collection.locationId.push({Id: locationId});
                    //console.log("foundCollection.collectionsOfObject.initlength: ", foundCollection.collectionsOfObject.length);
                    foundCollection.collectionsOfObject.push(collection);

                    foundCollection.save().then(res.status(200).json({ message: 'success', data: collection }));
                }

                //update user's current grid
                let updateStatus1 = await User.users.findOneAndUpdate({ $and: [{ uid: req.authId.uid }, { "currentGrid.objectName": req.body.objectName }] },
                    {
                        $set: {

                            "currentGrid.$.inGrid": true
                        }
                    }
                );


            }
            // console.log(foundCollection);

        }
    }
    );
}

//set user's currentGrid card to true
const setUserCurrentGrid = async (req, res) => {
    User.users.findOne({ uid: req.authId.uid }, async function (err, foundCollection) {
        if (err || !foundCollection) {
            res.status(301).json({ message: 'error' });
        } else {
            //update user's current grid
            let updateStatus1 = await User.users.findOneAndUpdate({ $and: [{ uid: req.authId.uid }, { "currentGrid.objectName": req.body.objectName }] },
                {
                    $set: {

                        "currentGrid.$.inGrid": true
                    }
                }
            );

            res.status(200).json({ message: 'success' });

        }
    });

}

//remove card from user's current grid
const removeFromUserCurrentGrid = async (req, res) => {
    User.users.findOne({ uid: req.authId.uid }, async function (err, foundCollection) {
        if (err || !foundCollection) {
            res.status(301).json({ message: 'error' });
        } else {
            //update user's current grid
            let updateStatus1 = await User.users.findOneAndUpdate({ $and: [{ uid: req.authId.uid }, { "currentGrid.objectName": req.body.objectName }] },
                {
                    $pull: {

                        "currentGrid": {objectName: req.body.objectName}
                    }
                }
            );

            res.status(200).json({ message: 'success' });

        }
    });
}



module.exports = {
    updateUserCollection,
    collectCard,
    setUserCurrentGrid,
    removeFromUserCurrentGrid
};