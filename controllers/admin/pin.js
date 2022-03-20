const Object = require('../../models/admin/object');
const { users } = require('../../models/login/users');
const { session } = require('../../config/neo4j')
var { nanoid } = require("nanoid");


const addPin = async (req, res) => {
    Object.object.findOne({ objectName: req.body.objectName }, async function (err, foundObject) {
        if (foundObject) {

            const result = await session.run(`MATCH (u) return u`)
            const totalPins = result.records.length;

            //3dmodel url is missing
            // console.log(foundObject._3dModelURL);

            //3dmodel url is missing
            var ID = nanoid();
            const isActivated = true;
            const create = await session.run(
                'CREATE (p: Pins {_id: $_id, locationName: $locationName, objectName: $objectName, lat: $lat, lng: $lng, imageURL: $imageURL, isActivated: $isActivated, _3dModelUrls: $_3dModelUrls}) RETURN p',
                {
                    _id: ID,
                    locationName: req.body.locationName,
                    objectName: req.body.objectName,
                    lat: req.body.lat,
                    lng: req.body.lng,
                    imageURL: foundObject.imageURL,
                    _3dModelUrls: foundObject._3dModelUrls,
                    isActivated: isActivated
                }
            )
            const singleRecord = create.records[0]
            const node = singleRecord.get(0)

            //contain details of created pins
            const newPin = node.properties;

            res.status(200).json({ message: "success", data: newPin });
        } else {
            res.status(301).json({ message: "success", data: "object NOT found" });
        }
    });
};


const getPins = async (req, res) => {

    const result = await session.run(`MATCH (pins: Pins) return pins`)
    const pins = result.records.map(i => i.get('pins').properties);
    //console.log(pins);

    // let pins = await Object.pin.find(); 

    let objects = await Object.object.find();
    if (pins) {
        res.send({ pins: pins, objects: objects });
    } else {
        res.status(301).json({ message: "error" });
    }

    //res.send({ message: "hello" });
}

const deletePins = async (req, res) => {
    //console.log(req.body.id);


    const result = await session.run(`MATCH (pins: Pins {_id: $_id}) DETACH DELETE pins`,
        {
            _id: req.body.id
        }
    )
    // const pins = result.records.map(i => i.get('pins').properties);
    // console.log(pins);

    res.status(200).json({ message: 'ok', data: 'pin deleted succesfully' })
}



module.exports = {
    addPin,
    getPins,
    deletePins
};