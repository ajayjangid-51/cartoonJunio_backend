const bcrypt = require("bcryptjs");
const User = require("../../models/login/users");
const Otp = require("../../models/login/otp");
const { object } = require("../../models/admin/object");
const nodemailer = require("nodemailer");
const SendOtp = require("sendotp");
const referralCodeGenerator = require("referral-code-generator");
const ObjectId = require("mongodb").ObjectId;
const { pin } = require("../../models/admin/object");
const { session } = require("../../config/neo4j");
const jwt = require("jsonwebtoken");
// const client = require("../")
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sanskarmaliwad1@gmail.com", //email ID
    pass: "Sanskar123@", //Password
  },
});

function sendMail(email, otp) {
  var details = {
    from: "sanskarmaliwad1@gmail.com", // sender address same as above
    to: email, // Receiver's email id
    subject: "Your demo OTP is ", // Subject of the mail.
    html:
      "<h3>OTP for account verification is </h3>" +
      "<h1 style='font-weight:bold;'>" +
      otp +
      "</h1>", // Sending OTP
  };

  transporter.sendMail(details, function (error, data) {
    if (error) console.log(error);
    else console.log(data);
  });
}

function generateUID() {
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-4);
  secondPart = ("000" + secondPart.toString(36)).slice(-4);
  var possibleReferral = firstPart + secondPart;

  User.storedReferrals.find(
    { allotedReferral: possibleReferral },
    async function (err, foundReferral) {
      if (foundReferral.length == 0) {
        let newReferral = new User.storedReferrals({
          allotedReferral: possibleReferral,
        });
        let response = await newReferral.save();
      } else {
        generateUID();
      }
    }
  );
  return possibleReferral;
}

function addReferral(enteredReferral, idToSave) {
  User.users.find({}, async function (err, foundUsers) {
    if (err) {
      res.status(301).json({ message: "Error" });
    } else {
      for (var i = 0; i < foundUsers.length; i++) {
        if (foundUsers[i].referralCode == enteredReferral) {
          var id = new ObjectId(foundUsers[i].id);

          User.users.findOne({ _id: id }, async function (err, found) {
            if (err) {
              res.status(301).json({ message: "Error" });
            } else {
              if (found.referrals.length == 0) {
                let newReferral = new User.referral({
                  count: 1,
                });
                newReferral.userId.push(idToSave);
                found.referrals.push(newReferral);
              } else {
                found.referrals[0].count += 1;
                found.referrals[0].userId.push(idToSave);
              }
              let response = await found.save();
            }
          });
        }
      }
    }
  });
}
const userList = async (req, res) => {
  let data = [{ name: "sanskar" }, { name: "amit" }];

  res.json(data);
};

const checkUser = async (req, res) => {
  // console.log(req.authId);

  // console.log(req.headers.authorization);

  User.users.findOne({ uid: req.authId.uid }, async (err, foundUser) => {
    // console.log(foundUser);

    if (!foundUser) {
      //add user node to neo4j database
      const createUser = await session.run(
        "CREATE (p: User {_id: $_id}) RETURN p",
        {
          _id: req.authId.uid,
        }
      );

      //user does not exist create userName
      total_players = await User.users.find().count();
      // console.log(total_players);
      let data = new User.users({
        userName: "player_" + (total_players + 1).toString(),
        uid: req.authId.uid,
        mobileNo: req.authId.phone_number,
      });
      let response = await data.save();

      // assign new grid to user
      object.find({}, async (err, foundObjects) => {
        if (err) {
          console.log({ message: "error: objects not found" });
          res.status(404).send({ message: "error: objects not found" });
        } else {
          const shuffledGrid = foundObjects.sort(() => 0.5 - Math.random());
          let selectedGrid = shuffledGrid.slice(0, 24);

          User.users.findOne(
            { uid: req.authId.uid },
            async function (err, foundUser) {
              if (err || !foundUser) {
                // res.send({ message: "Error" })
                console.log({ message: "Error: user not found" });
                res.status(404).send({ message: "Error: user not found" });
              } else {
                function addGridObject(item) {
                  let collection = new User.currentGrids({
                    objectId: item._id,
                    imageURL: item.imageURL,
                    objectName: item.objectName,
                    _3dModelURL: item._3dModelURL,
                  });

                  foundUser.currentGrid.push(collection);
                }
                selectedGrid.forEach(addGridObject);

                let response = await foundUser.save();
                // console.log('response: ',response);

                // res.send({ message: 'Grid assgined successfully'})
                console.log({ message: "Grid assigned successfully" });
                // res.send({ message: 'Grid assgined successfully'})
              }
            }
          );
        }
      });

      //console.log(await User.users.findOne({ uid: req.authId.uid}));

      // assign 20 random cards to user
      const result = await session.run(`MATCH (pins: Pins) return pins`);
      const foundPins = result.records.map((i) => i.get("pins").properties);
      // console.log(foundPins.length);

      const shuffledPins = foundPins.sort(() => 0.5 - Math.random());
      let selectedPins = shuffledPins.slice(0, 20);

      async function addPins(pin) {
        var foundUser1 = await User.users.findOne({ uid: req.authId.uid });
        // console.log(foundUser1);
        if (err || !foundUser1) {
          // res.send({ message: "Error" })
          console.log({ message: "Error: user not found allocating cards" });
          res
            .status(404)
            .send({ message: "Error: user not found for allocating cards" });
        } else {
          objectName = pin.objectName;
          var foundObjectUser = await User.users.findOne({
            uid: req.authId.uid,
            "collectionsOfObject.objectName": objectName,
          });

          if (!foundObjectUser) {
            let collection = new User.collectionsOfObjects({
              // objectId: pin._id,
              imageURL: pin.imageURL,
              objectName: pin.objectName,
              _3dModelURL: pin._3dModelURL,
              count: 1,
              locationId: [{ Id: pin._id }],
            });
            // collection.locationId.push(locationId);

            foundUser1.collectionsOfObject.push(collection);
            await foundUser1.save();
          } else {
            updateResult = await User.users.findOneAndUpdate(
              {
                uid: req.authId.uid,
                "collectionsOfObject.objectName": objectName,
              },
              {
                $inc: {
                  "collectionsOfObject.$.count": 1,
                },
                $push: { "collectionsOfObject.$.locationId": { Id: pin._id } },
              }
            );
          }

          //create relation
          const createRelation = await session.run(
            `MATCH(u: User { _id: $_id}) \
                        MATCH(p: Pins { _id: $locationId }) \
                        CREATE (u) - [: COLLECTED] -> (p) \
                        return p`,
            {
              _id: req.authId.uid,
              locationId: pin._id,
            }
          );
        }
      }
      for (const pin of selectedPins) {
        // console.log('selectedPins', pin);
        await addPins(pin);
      }
      console.log({ message: "cards assigned successfully" });

      res.send({ message: "Assigned new grid and 20 cards to new user" });
    } else if (err) {
      res.status(404).json({ message: "error finding user" });
    } else {
      // user already exist do nothing
      // res.status(200).json({ message: 'ok' , statusText: "User found", userName: foundUser.userName});
      res.status(200).send({ message: "Already existing user authenticated" });
    }
  });
};

// Web registration

const userAdd = async (req, res) => {
  // var id = req.body.id;
  // var userId = new ObjectId(id);

  User.users.find({ email: req.body.email }, async function (err, foundUser) {
    // console.log(referralCodeGenerator.alphaNumeric('uppercase', 3, 2));

    if (foundUser.length == 1) {
      res.send({ message: "error", data: "email already exist" });
    } else {
      let { userName, email, mobileNo, password, reEnterPassword } = req.body;
      if (!(userName && email && mobileNo && password && reEnterPassword)) {
        return res
          .status(400)
          .send({ message: "error", data: "All fields are required" });
      }

      let data = new User.users({
        userName: userName,
        email: email,
        mobileNo: mobileNo,
        password: password,
      });
      let response = await data.save();
      let myToken = await data.getAuthToken();

      res.cookie("jwt", myToken);

      User.users.findOne(
        { email: req.body.email },
        async function (err, foundUser1) {
          if (err || !foundUser1) {
            res.send({ message: "error" });
          } else {
            object.find({}, async function (err, foundObject) {
              if (err) {
                res.send({ message: "error" });
              } else {
                function myFunction(item) {
                  let collection = new User.collectionsOfObjects({
                    objectName: item.objectName,
                    imageURL: item.imageURL,
                    _3dModelURL: item._3dModelURL,
                  });

                  foundUser1.collectionsOfObject.push(collection);
                }
                foundObject.forEach(myFunction);

                var referralCode = generateUID();
                foundUser1.referralCode = referralCode;

                if (req.body.referral) {
                  addReferral(req.body.referral, foundUser1.id);
                }

                let responseObject = await foundUser1.save();
              }
            });
            res.send({
              message: "success",
              data: "registered succesfully, Please login now.",
              token: myToken,
              foundUserId: foundUser1.id,
            });
          }
        }
      );
    }
  });
};

// mobile registration

const mobileRegister = async (req, res) => {
  
  User.users.find({ mobileNo: req.body.mobileNo }, async function (err, foundUser) {
    // console.log(referralCodeGenerator.alphaNumeric('uppercase', 3, 2));

    if (foundUser.length == 1) {
      res.send({ message: "error", data: "Mobile number already exist" });
    } else {
      let { userName, email, mobileNo, password ,address} = req.body;
      if (!(userName && email && mobileNo && password && address )) {
        return res
          .status(400)
          .send({ message: "error", data: "All fields are required" });
      }

      let data = new User.users({
        userName: userName,
        email: email,
        mobileNo: mobileNo,
        password: password,
        address:address
      });
      let response = await data.save();
      let myToken = await data.getAuthToken();


      res.cookie("jwt", myToken);

      User.users.findOne(
        { email: req.body.email },
        async function (err, foundUser1) {
          if (err || !foundUser1) {
            res.send({ message: "error" });
          } else {
            object.find({}, async function (err, foundObject) {
              if (err) {
                res.send({ message: "error" });
              } else {
                function myFunction(item) {
                  let collection = new User.collectionsOfObjects({
                    objectName: item.objectName,
                    imageURL: item.imageURL,
                    _3dModelURL: item._3dModelURL,
                  });

                  foundUser1.collectionsOfObject.push(collection);
                }
                foundObject.forEach(myFunction);

                var referralCode = generateUID();
                foundUser1.referralCode = referralCode;

                if (req.body.referral) {
                  addReferral(req.body.referral, foundUser1.id);
                }

                let responseObject = await foundUser1.save();
              }
            });
            res.send({
              message: "success",
              data: "registered succesfully, Please login now.",
              token: myToken,
              foundUserId: foundUser1.id,
            });
          }
        }
      );
    }
  });
};

// mobile login

const mobileLogin = async (req, res) => {
  const { mobileNo, password } = req.body;
  if (!mobileNo || !password) {
    res.send({ message: "Invalid input" });
  } else {
    User.users.findOne({ mobileNo: mobileNo }, async (err, foundUser) => {
      if (foundUser) {
        var match = await bcrypt.compare(password, foundUser.password);

        if (match) {

          let myToken = await foundUser.getAuthToken();
      res.cookie("jwt", myToken);
      object.find({}, async function (err, foundObject) {
        if (err) {
          res.send({ message: "error" });
        } else {
          function myFunction(item) {
            let collection = new User.collectionsOfObjects({
              objectName: item.objectName,
              imageURL: item.imageURL,
              _3dModelURL: item._3dModelURL,
            });

            foundUser.collectionsOfObject.push(collection);
          }
          foundObject.forEach(myFunction);

          var referralCode = generateUID();
          foundUser.referralCode = referralCode;

          if (req.body.referral) {
            addReferral(req.body.referral, foundUser.id);
          }

          // let responseObject = await foundUser.save();
        }
      });
      res.send({
        message: "success",
        data: "Login Succesfully",
        token: myToken,
        foundUserId: foundUser.id,
      });
        } else {
          res.send({ message: "error", data: "password didn't match" });
        }
      } else {
        res.send({ message: "error", data: "User Not registered" });
      }
    });
  }
};

// Web Login

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.send({ message: "Invalid input" });
  } else {
    User.users.findOne({ email: email }, async (err, foundUser) => {
      if (foundUser) {
        var match = await bcrypt.compare(password, foundUser.password);

        if (match) {
          let myToken = await foundUser.getAuthToken();
          res.send({ message: "success", data: "Login Succesfully" });
        } else {
          res.send({ message: "error", data: "password didn't match" });
        }
      } else {
        res.send({ message: "error", data: "User Not registered" });
      }
    });
  }
};

const emailSend = async (req, res) => {
  let data = await User.users.findOne({ email: req.body.email });
  const responseType = {};

  if (data) {
    let otpCode = Math.floor(Math.random() * 10000 + 1);
    let otpData = new Otp({
      email: req.body.email,
      code: otpCode,
      expireIn: new Date().getTime() + 300 * 1000,
    });
    let otpResponse = await otpData.save();
    responseType.message = "success";
    sendMail(req.body.email, otpCode);
    responseType.data = "Please check your email";
  } else {
    responseType.message = "Error";
    responseType.data = "Email not exist";
  }
  res.status(200).json(responseType);
};

const changePassword = async (req, res) => {
  let data = await Otp.findOne({
    email: req.body.email,
    code: req.body.otpCode,
  });
  const responseType = {};
  if (data) {
    let currentTime = new Date().getTime();
    let diff = data.expireIn - currentTime;
    if (diff < 0) {
      responseType.data = "Token expire";
      responseType.message = "error";
    } else {
      let user = await User.users.findOne({ email: req.body.email });
      user.password = req.body.password;
      user.save();
      responseType.data = "Password Changed successfully!";
      responseType.message = "uccess";
    }
  } else {
    responseType.data = "Invalid OTP";
    responseType.message = "error";
  }

  res.status(200).json(responseType);
};

const resetPassword = async (req, res) => {
  let user = await User.users.findOne({ email: req.body.email });
  var match = await bcrypt.compare(req.body.password, user.password);
  if (match) {
    user.password = req.body.newPassword;
    user.save();
    res
      .status(200)
      .json({ message: "success", data: "Password reset succesfully" });
  } else {
    res.status(301).json({ message: "error" });
  }
};

//profile update

const userUpdate = async (req, res) => {
  console.log(req.params.id);
  User.users
    .findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          userName: req.body.userName,
          email: req.body.email,
          mobileNo: req.body.mobileNo,
          address: req.body.address,
        },
      }
    )
    .then((result) => {
      res.status(200).json({ Updated: result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

// password update

const passwordUpdate = async (req, res) => {
const hashedPassword = await bcrypt.hash(req.body.password,10)

  User.users
    .findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {password: hashedPassword,
          
        },
      }
    )
    .then((result) => {
      res.status(200).json({ message: "Password Updated Succesfully" });

    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

const allUser = async (req, res) => {
  try {
    let user_id = req.params.id;
    let user = await User.users.findOne({ _id: user_id });
    return res.status(200).send({
      message: "success",
      data: user,
    });
  } catch (err) {
    return res.status(400).send({
      message: err.message,
      data: err,
    });
  }
};

const user_logout = async (req, res, next) => {
  req.session.destroy(()=>{
    req.logout();
    res.redirect("/login")
  })
};

module.exports = {
  userList,
  userAdd,
  userLogin,
  emailSend,
  userUpdate,
  passwordUpdate,
  allUser,
  mobileRegister,
  mobileLogin,
  changePassword,
  resetPassword,
  user_logout,
  checkUser,
};
