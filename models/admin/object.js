const mongoose = require('mongoose');
const conn = require('../../config/db');

const pinSchema = new mongoose.Schema({
    //TODO: add objectId
    // objectId: String,
    locationName: String,
    objectName: String,
    lat: Number,
    lng: Number,
    imageURL: String,
    _3dModelUrls: [String]
});

const objectSchema = new mongoose.Schema({
    objectName: String,
    imageName: String,
    _3dModelName: String,
    imageURL: String,
    _3dModelUrls: [String]
});

const object = conn.model('objects', objectSchema);
const pin = conn.model('pins', pinSchema);


module.exports ={object,pin, pinSchema};