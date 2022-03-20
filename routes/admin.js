const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const checkIfAuthenticated = require("../middleware/firebase_auth");
const upload = require('../middleware/upload');

const userCtrl = require('../controllers/user/login');

const userCollectionCtrl = require('../controllers/user/userCollection');
const gridCtrl = require('../controllers/user/grid');
const tradeCtrl = require('../controllers/user/trade');
const searchUserCtrl = require('../controllers/user/searchUser');
const sessionCtrl = require('../controllers/user/session');
const pinCtrl = require('../controllers/admin/pin');
const objectCtrl = require('../controllers/admin/object');

const userPinCtrl = require('../controllers/user/pin');

router.post("/admin-add-image", upload.uploadImage.single('image'), objectCtrl.addAndUploadImage);
router.post("/admin-add-model", upload.uploadImage.single('image'), objectCtrl.addAndUploadModel);
// router.post('/admin-add-3dImage',uploadModel.uploadModel.single('image'),objectCtrl.Add3dObject);
router.post('/admin-delete-object', objectCtrl.deleteObject);
router.post('/find-user-statistics', sessionCtrl.findUserStatistics);
router.post('/find-online-users', sessionCtrl.onlineUsers);
router.post('/add-pin-object', pinCtrl.addPin);
router.get('/getpins', pinCtrl.getPins);
router.post('/delete-pin', pinCtrl.deletePins);
router.get('/getobjects', objectCtrl.getObjects);
//to get all files name and url uploaded on google cloud 
router.get("/files", objectCtrl.getListFiles);
// download image by its name
router.get("/files/:name", objectCtrl.download);




module.exports = router;