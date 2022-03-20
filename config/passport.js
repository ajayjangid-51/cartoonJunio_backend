var JWTStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var User = require('../models/login/users');

module.exports = function (passport) {
    let params = {};
    params.secretOrKey = process.env.SECRETKEY;
    params.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();


    passport.use(
        new JWTStrategy(params, function (jwt_payload, next) {
            //console.log("hello");
            //console.log(jwt_payload);
            let emailId = jwt_payload.email;
            User.users.findOne({ email: emailId }, function (err, user) {
                if (err) {
                    return next(err, false);
                }
                if (user) {
                    next(null, user);
                } else {
                    next(null, false);
                }
            })
        })
    )
};

