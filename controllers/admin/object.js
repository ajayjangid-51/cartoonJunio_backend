const processFile = require("../../middleware/upload");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage")
const Object = require('../../models/admin/object');
const User = require('../../models/login/users')
const {session} = require('../../config/neo4j')
// Instantiate a storage client with credentials
const storage = new Storage({ keyFilename: "google-cloud-key.json" });
var bucket = null;

console.log(process.env.ENV);
if(process.env.ENV=='prod'){
    bucket = storage.bucket("ar-game-data");
} else {
    bucket = storage.bucket("ar-game-data-dev");
}




const addAndUploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: "error", data: "Please upload file!" });
        }
        // console.log((req.file.originalname).split('.').pop());

        var storagePath = null;
        var filename = null;
        
        // Create a new blob in the bucket and upload the file data.
        // if (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg' || req.file.mimetype == 'image/jpeg') {
        //     filename = req.body.name + '.' + (req.file.originalname).split('.').pop();
        //     storagePath = 'images/' + filename;
        // } else {
        //     filename = req.body.name + '.' + (req.file.originalname).split('.').pop();
        //     storagePath = 'objects/' + filename;
        // }
        filename = req.body.name + '.' + (req.file.originalname).split('.').pop();
        storagePath = 'images/' + filename;
        //console.log(storagePath);
        blob = bucket.file(storagePath);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on("error", (err) => {
            console.log(err);
            res.status(500).send({ message: err.message });
        });

        blobStream.on("finish", async (data) => {
            // Create URL for directly file access via HTTP.
            const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );

            try {
                // Make the file public
                await bucket.file(storagePath).makePublic();
            } catch (err){
                console.log(err);
                return res.status(500).send({
                    message:
                        `Uploaded the file successfully: ${filename}, but public access is denied!`,
                    url: publicUrl,
                });
            }

            // if (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg' || req.file.mimetype == 'image/jpeg') {
               
                Object.object.findOne({ objectName: req.body.name }, async (err, foundObject) => {
                    // console.log(req.body.image);
                    // console.log(req.file);
                    if (err) {
                        res.send({ message: "error", data: "error" });
                    } else {
                        if (foundObject) {
                            // console.log(foundObject);
                            res.send({ message: "error", data: "object already exists!!" });
                            
                        } else {
                            let objectData = new Object.object({
                                objectName: req.body.name
                            })
                            if (req.file) {
                                // objectData.objectImage = req.file.path;
                                objectData.imageName = filename
                                objectData.imageURL = publicUrl
                            }
                            let objectResponse = await objectData.save();

                            // res.status(200).json({ message: 'ok', status: 'object added successfully' })
                        }
                    }
                })
            // }else{
            //     Object.object.findOne({ objectName: req.body.name }, async (err, foundObject) => {
            //         if(err){
            //             res.send({message: "error", data: "error"});
            //         }else{
            //             if(req.file){
            //                 foundObject._3dModelURL = publicUrl;
            //                 foundObject._3dModelName = filename
            //                 let response = await foundObject.save();
            //             }
            //             // res.status(200).json({message: 'ok', status: "3d model added successfully"});
            //         }
            //     });
            // }

            res.status(200).send({

                message: "success " ,
                data: "object added succesfully!",
                url: publicUrl,
            });
        });

        blobStream.end(req.file.buffer);
    } catch (err) {
        res.status(500).send({
            message: "error",
            status: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
//res.send({status: "ok"});
};

const addAndUploadModel = async (req, res) => {
    try {
        //console.log(req.file);
       
        
        // console.log(req.body.name);

        if (!req.file) {
            return res.status(400).send({ message: "error", data: "Please upload file!" });
        }
        // console.log((req.file.originalname).split('.').pop());

        var storagePath = null;
        var filename = null;
        
        // Create a new blob in the bucket and upload the file data.
        // if (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg' || req.file.mimetype == 'image/jpeg') {
        //     filename = req.body.name + '.' + (req.file.originalname).split('.').pop();
        //     storagePath = 'images/' + filename;
        // } else {
        //     filename = req.body.name + '.' + (req.file.originalname).split('.').pop();
        //     storagePath = 'objects/' + filename;
        // }
        // filename = req.body.name + '.' + (req.file.originalname).split('.').pop();
        filename = req.file.originalname;
        storagePath = 'objects/' + req.body.name + '/' + filename;
        //console.log(storagePath);
        blob = bucket.file(storagePath);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on("error", (err) => {
            console.log(err);
            res.status(500).send({ message: err.message });
        });

        blobStream.on("finish", async (data) => {
            // Create URL for directly file access via HTTP.
            const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );

            try {
                // Make the file public
                await bucket.file(storagePath).makePublic();
            } catch (err){
                console.log(err);
                return res.status(500).send({
                    message:
                        `Uploaded the file successfully: ${filename}, but public access is denied!`,
                    url: publicUrl,
                });
            }

            // if (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg' || req.file.mimetype == 'image/jpeg') {
               
            //     Object.object.findOne({ objectName: req.body.name }, async (err, foundObject) => {
            //         // console.log(req.body.image);
            //         // console.log(req.file);
            //         if (err) {
            //             res.send({ message: "error", data: "error" });
            //         } else {
            //             if (foundObject) {
            //                 // console.log(foundObject);
            //                 res.send({ message: "error", data: "object already exists!!" });
            //             } else {
            //                 let objectData = new Object.object({
            //                     objectName: req.body.name
            //                 })
            //                 if (req.file) {
            //                     // objectData.objectImage = req.file.path;
            //                     objectData.imageName = filename
            //                     objectData.imageURL = publicUrl
            //                 }
            //                 let objectResponse = await objectData.save();

            //                 // res.status(200).json({ message: 'ok', status: 'object added successfully' })
            //             }
            //         }
            //     })
            // }else{
                Object.object.findOne({ objectName: req.body.name }, async (err, foundObject) => {
                    if(err){
                        res.send({message: "error", data: "error"});
                    }else{
                        if(req.file){
                            foundObject._3dModelUrls.push(publicUrl);
                            // foundObject._3dModelName = filename
                            let response = await foundObject.save();
                        }
                        // res.status(200).json({message: 'ok', status: "3d model added successfully"});
                    }
                });
            // }

            res.status(200).send({

                message: "success " ,
                data: "object added succesfully!",
                url: publicUrl,
            });
        });

        blobStream.end(req.file.buffer);
    } catch (err) {
        res.status(500).send({
            message: "error",
            status: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
//res.send({status: "ok"});
};

const getListFiles = async (req, res) => {
    try {
        const [files] = await bucket.getFiles();
        let fileInfos = [];

        files.forEach((file) => {
            fileInfos.push({
                name: file.name,
                url: file.metadata.mediaLink,
            });
        });

        res.status(200).send(fileInfos);
    } catch (err) {
        console.log(err);

        res.status(500).send({
            message: "error",
            data: "Unable to read list of files!"
        });
    }

};

const download = async (req, res) => {
    try {
        const [metaData] = await bucket.file(req.params.name).getMetadata();
        res.redirect(metaData.mediaLink);

    } catch (err) {
        res.status(500).send({
            message: "error",
            data: "Could not download the file. " + err,
        });
    }
};


const deleteObject = async (req, res) => {
    let data = await Object.object.findOne({ _id: req.body.id });
    if (data) {

        // Object.pin.deleteMany({ object: data.objectName }, function (err, obj) {
        //     if (err) {
        //         res.status(301).json({ message: 'error', data: 'failed to delete' })
        //     }
        // });

        //deactivate pins
        const isActivated = false;
        const updatePins = await session.run(
            'MATCH (p:Pins {objectName: $objectName}) \
            SET p.isActivated= $isActivated \
            RETURN p',
            {
                objectName: data.objectName,
                isActivated: isActivated
            }
        )
        const pins = updatePins.records.map(i => i.get('p').properties);
        // console.log(pins);

        // res.send({data: "hello"});



        Object.object.deleteOne({ _id: req.body.id }, function (err, obj) {

            if (err) {

                res.status(301).json({ message: 'error', data: 'failed to delete' })
            } else {
                res.status(200).json({ message: 'success', data: 'deleted succesfully' })
            }
        });

    } else {
        res.status(301).json({ message: 'error', data: 'object not founded' })
    }
};

//FOR ADMIN
const getObjects = async (req, res) => {
    let objects = await Object.object.find();
    if (objects) {
        res.send({ objects: objects });
    } else {
        res.status(301).json({ message: "error" });
    }
}

//FOR USER 
//get user's object from collectionSchema

const getUserObject = async (req, res) => {
    User.users.findOne({ _id: req.body.id }, (err, foundUser) => {
        if (err) {
            res.send({ message: "error" });
        } else {
            //console.log(foundUser.collectionsOfObject);
            res.send({ message: "success", object: foundUser.collectionsOfObject });
        }
    });
}

const getAllCards = async (req, res) => {
    User.users.findOne({ uid: req.authId.uid }, (err, foundUser) => {
        if (err) {
            res.send({ message: "error" });
        } else {
            //console.log(foundUser.collectionsOfObject);
            res.send({ message: "success", data: foundUser.collectionsOfObject});
        }
    });
}

const getGrid = async (req, res) => {
    User.users.findOne({ uid: req.authId.uid }, (err, foundUser) => {
        if (err) {
            res.send({ message: "error" });
        } else {
            //console.log(foundUser.collectionsOfObject);
            res.send({ message: "success", data: foundUser.currentGrid});
        }
    });
}

module.exports = {
    addAndUploadImage,
    addAndUploadModel,
    getListFiles,
    download,
    deleteObject,
    getObjects,
    getUserObject,
    getAllCards,
    getGrid
}