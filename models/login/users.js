const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const conn = require("../../config/db");
const { pinSchema } = require("../admin/object");

const storedReferralSchema = new mongoose.Schema({
  allotedReferral: String,
});

const idSchema = new mongoose.Schema({
  Id: String,
});

const referralSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 0,
  },
  userId: [idSchema],
});
//add url
const collectionSchema = new mongoose.Schema({
  //TODO: add objectId
  // objectId: String,
  objectName: String,
  count: {
    type: Number,
    default: 0,
  },
  locationId: [idSchema],
  imageURL: String,
  _3dModelUrls: [String],
});

const currentGridSchema = new mongoose.Schema({
  objectId: String,
  objectName: String,
  inGrid: {
    type: Boolean,
    default: "false",
  },
  imageWatermarkURL: String, //??
  imageURL: String, //??
  _3dModelUrls: [String],
});

const objectIdSchema = new mongoose.Schema({
  objectId: String,
});

const pastGridSchema = new mongoose.Schema({
  objects: [idSchema],
  gridCompletionTimeStamp: Date,
  gridName: String,
});

const redeemHistorySchema = new mongoose.Schema({
  pointsRedeemed: Number,
  rewardReceived: String,
  timeStamp: Date,
});

const friendSchema = new mongoose.Schema({
  friendId: String,
});

const lastSessionSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
});

const lastSessions = conn.model("lastSession", lastSessionSchema);
const referral = conn.model("referrals", referralSchema);
const currentGrids = conn.model("currentGrids", currentGridSchema);
const Ids = conn.model("objectIds", idSchema);
const pastGrids = conn.model("pastGrids", pastGridSchema);
const redeemHistorys = conn.model("redeemHistorys", redeemHistorySchema);
const friends = conn.model("friends", friendSchema);
const collectionsOfObjects = conn.model("collections", collectionSchema);
const storedReferrals = conn.model("storedReferrals", storedReferralSchema);

const userSchema = new mongoose.Schema(
  {
    // _id: String,
    userName: String,
    email: String,
    mobileNo: String,
    address: String,
    password: String,
    uid: String,
    online: {
      type: Boolean,
      default: "false",
    },
    image:{
      data: Buffer,
      contentType: String
  },
    //lastSession: 1.sessionStart 2.endTime
    //last - 1 days , 7 days, 15 days, 30 days , 1 hours, 6 hours
    lastSession: [lastSessionSchema],
    referralCode: String,
    referrals: [referralSchema],
    collectionsOfObject: [collectionSchema],
    //collectedPins:[idSchema],
    // notCollectedPins:[idSchema],
    currentGrid: [currentGridSchema],
    pastGrids: [pastGridSchema],

    points: {
      type: Number,
      default: 0,
    },

    redeemHistory: [redeemHistorySchema],
    nearbyPins: [idSchema],
    friends: [friendSchema],

    tokens: [
      {
        token: {
          type: String,
          require: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  var salt = bcrypt.genSaltSync(10);
  if (this.password && this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, salt);
  }

  next();
});

userSchema.methods.getAuthToken = async function (data) {
  let params = {
    id: this.id,
    email: this.email,
    mobileNo: this.mobileNo,
  };
  
  var tokenValue = jwt.sign(params, process.env.SECRETKEY);
  this.tokens = this.tokens.concat({ token: tokenValue });
  await this.save();

  return tokenValue;
};

const users = conn.model("users", userSchema);

module.exports = {
  users,
  referral,
  Ids,
  pastGrids,
  redeemHistorys,
  collectionsOfObjects,
  currentGrids,
  storedReferrals,
  lastSessions,
};
