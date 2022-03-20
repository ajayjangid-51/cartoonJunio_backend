const User = require('../../models/login/users');
const Object = require('../../models/admin/object');
const ObjectId = require('mongodb').ObjectId;
const haversine = require('haversine-distance')
const { session } = require('../../config/neo4j');



const getNearbyPins = async (req, res) => {
    User.users.findOne({ uid: req.authId.uid }, async (err, foundUser) => {
    // User.users.findOne({ _id: req.body.id }, async (err, foundUser) => {
        // console.log(foundUser);
        const radius = 1000;
        if (err || !foundUser) {
            res.send({ message: "error" });
        } else {

            const userLocation = { latitude: req.body.lat, longitude: req.body.lng };
            const isActivated = true;
            const result = await session.run(
                `MATCH(p: Pins) \
                 MATCH(u: User { _id: $_id }) \
                 WHERE  NOT EXISTS((u) - [: COLLECTED] -> (p)) AND p.isActivated = $isActivated \
                 return p`,
                {
                    _id: req.authId.uid ,
                    isActivated: isActivated
                }
            )
            
            //all pins which are not collected yet by user
            const allPins = result.records.map(i => i.get('p').properties);
            //console.log(allPins);

            let nearbyPins = [];
            for (const pin of allPins) {
                const pinLocation = { latitude: pin.lat, longitude: pin.lng };

                //distance is in meter
                const distanceBetweenLocations = haversine(userLocation, pinLocation);

                //converted in kilometer
                if (distanceBetweenLocations / 1000 <= radius) {
                    nearbyPins.push({Id: pin._id});
                }
            }

            
            foundUser.nearbyPins = nearbyPins;
            try{
                await foundUser.save();
                res.send({ message: "success", data: nearbyPins});
            } catch(err) {
                res.send({ message: "error" });
            }    
        }
    });
}

module.exports = { getNearbyPins };