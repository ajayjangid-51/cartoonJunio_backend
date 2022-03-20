const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const path = require("path");
const checkIfAuthenticated = require("../middleware/firebase_auth");
const {uploadImage} = require("../middleware/upload");

const userCtrl = require("../controllers/user/login");

const userCollectionCtrl = require("../controllers/user/userCollection");
const gridCtrl = require("../controllers/user/grid");
const tradeCtrl = require("../controllers/user/trade");
const searchUserCtrl = require("../controllers/user/searchUser");
const sessionCtrl = require("../controllers/user/session");
const pinCtrl = require("../controllers/admin/pin");
const objectCtrl = require("../controllers/admin/object");
const userPinCtrl = require("../controllers/user/pin");

const User = require("../models/login/users");

const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

var passport = require("passport");
require("../config/passport")(passport);

router.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

//USER LOGIN API's

router.get("/list", userCtrl.userList);
router.post("/register", userCtrl.userAdd);
router.post("/mobile/register", userCtrl.mobileRegister);
router.post("/login", userCtrl.userLogin);
router.post("/mobile/login",userCtrl.mobileLogin);
//below two API's are for forgot password
router.post(
  "/email-send",
  passport.authenticate("jwt", { session: false }),
  userCtrl.emailSend
);
router.post(
  "/change-forgotten-password",
  passport.authenticate("jwt", { session: false }),
  userCtrl.changePassword
);
//Reset password
router.post(
  "/reset-password",
  passport.authenticate("jwt", { session: false }),
  userCtrl.resetPassword
);
router.post(
  "/search-user",
  passport.authenticate("jwt", { session: false }),
  searchUserCtrl.searchUser
);

//USER API's - related to object

//User Collection APIs
router.post(
  "/update-user-collection",
  passport.authenticate("jwt", { session: false }),
  userCollectionCtrl.updateUserCollection
);
// collect card from map
router.post(
  "/collect-card",
  checkIfAuthenticated,
  userCollectionCtrl.collectCard
);

//Current Grid API's
router.post(
  "/update-current-grid",
  passport.authenticate("jwt", { session: false }),
  gridCtrl.addScannedObject
);
//Trade API's
router.post(
  "/trade-object",
  passport.authenticate("jwt", { session: false }),
  tradeCtrl.tradeObject
);

//assign current grid to user
router.post("/assign-current-grid", checkIfAuthenticated, gridCtrl.assignGrid);

//get object which present in user's collectionSchema
router.get("/get-user-object", objectCtrl.getUserObject);
// get all cards in user's collection
router.get("/get-cards", checkIfAuthenticated, objectCtrl.getAllCards);
// get user's current grid
router.get("/get-grid", checkIfAuthenticated, objectCtrl.getGrid);
// update user's nearby pins
router.post(
  "/get-nearby-pins",
  checkIfAuthenticated,
  userPinCtrl.getNearbyPins
);

router.get("/check", checkIfAuthenticated, userCtrl.checkUser);

router.post(
  "/set-user-current-grid",
  checkIfAuthenticated,
  userCollectionCtrl.setUserCurrentGrid
);

router.post(
  "/remove-user-current-grid",
  checkIfAuthenticated,
  userCollectionCtrl.removeFromUserCurrentGrid
);

//For testing purpose

// router.post('/push-location-id', async (req, res) => {
//   User.users.findOne({email: req.body.email}, async (err, foundUser) => {
//     if(err){
//       res.send({message: "error"});
//     }else{
//       const newId = User.Ids({
//         Id: req.body.Id
//       });

//       foundUser.collectedPins.push(newId);
//       foundUser.save();
//     }
//   });

//   res.send({ message: "success" });
// });

// update user profile

router.put('/:id',passport.authenticate("jwt", { session: false }),userCtrl.userUpdate);

router.get("/logout",userCtrl.user_logout)
//update password
router.put("/:id/passwordupdate",passport.authenticate("jwt", { session: false }),userCtrl.passwordUpdate)

// get user profile

router.get("/:id",passport.authenticate("jwt", { session: false }), userCtrl.allUser);

//Session API's

router.post("/update-lastsession", sessionCtrl.updateLastSession);
router.post("/add-new-session", sessionCtrl.addNewSession);

router.post('/uploadfile', uploadImage.single('myFile'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
    res.send(file)
  
})

module.exports = router;
