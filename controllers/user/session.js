const User = require('../../models/login/users');
const userSession = require('../../models/admin/session');
const ObjectId = require('mongodb').ObjectId;


function nextmonth(i) {
    var today = new Date();
    var nextweek = new Date(today.getFullYear(), today.getMonth() - i, today.getDate());
    return nextweek;
}
function nextweek(i) {
    var today = new Date();
    var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    return nextweek;
}
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const updateLastSession = async (req, res) => {
    var id = req.body.id;
    var userId = new ObjectId(id);

    var today = new Date();
    User.users.findOne({ _id: id }, async function (err, foundUser) {
        if (err) {
            res.status(301).json({ message: 'Error' });
        } else {
            //console.log(today);
            if (foundUser.lastSession.length == 0) {   //if user login for the first time ever
                let newSession = new User.lastSessions({
                    startTime: today,
                    endTime: today
                });
                foundUser.lastSession.push(newSession);

            } else if (req.body.isUserGoingOffline) { // if user is going offline

                foundUser.lastSession[0].endTime = today;

            } else { //if user is coming online
                // console.log("coming online")
                foundUser.lastSession[0].startTime = today;
                foundUser.lastSession[0].endTime = today;
            }
            let response = foundUser.save();
            res.status(200).json({ message: 'success', data: "Session updated succesfully" });
        }
    });
}

const addNewSession = async (req, res) => {
    const newSession = new userSession({
        userId: req.body.userId,
        sessionId: req.body.sessionId,
        startTime: req.body.startTime,
    });

    if (req.body.endTime) {
        newSession.endTime = req.body.endTime;
        const days = parseInt(Math.abs(newSession.endTime - newSession.startTime) / (1000 * 60 * 60 * 24));
        const hours = parseInt(Math.abs(newSession.endTime - newSession.startTime) / (1000 * 60 * 60) % 24);
        const minutes = parseInt(Math.abs(newSession.endTime.getTime() - newSession.startTime.getTime()) / (1000 * 60) % 60);
        const seconds = parseInt(Math.abs(newSession.endTime.getTime() - newSession.startTime.getTime()) / (1000) % 60);
        newSession.totalTime = 86400 * days + hours * 3600 + minutes * 60 + seconds;
    }

    let response = await newSession.save();
    res.send({ message: "success" , data: "session created" });
}

const findUserStatistics = async (req, res) => {

    var userData = [];
    // console.log(req.body);

    var previousUsers = 0;
    var currentUsers = 0;
    var user_percentage;

    var previousStartInterval = new Date();
    var previousEndInterval = new Date();
    var currentStartInterval = new Date();
    var currentEndInterval = new Date();

    var current_sessions = 0;
    var previous_sessions = 0;
    var sesssion_percentage;

    var current_session_duration = 0;
    var previous_session_duration = 0;
    var average_session_duration;
    var session_duration_percentage;


    if (req.body.time == "today") {
        // console.log("I am in day")

        for (var i = 0; i <= 24; i += 3) {
            let newData = {
                name: i + ((i > 12) ? ":00 PM" : ":00 AM"),
                Active_user: Math.floor(Math.random() * 1000)
            }
            userData.push(newData);
        }

        previousStartInterval.setDate(previousStartInterval.getDate() - 1);
        previousStartInterval.setHours(0, 0, 0, 0);

        previousEndInterval.setDate(previousEndInterval.getDate() - 1);
        previousEndInterval.setHours(23, 59, 0, 0);

        currentStartInterval.setHours(0, 0, 0, 0);
        currentEndInterval.setHours(23, 59, 0, 0);

        //console.log(previousEndInterval.getDate() + " " +  previousEndInterval.getHours() + " " + previousEndInterval.getMinutes())
    } else if (req.body.time == "week") {
        //  console.log("I am in week")
        for (var i = 6; i >= 0; i--) {
            let newDate = nextweek(i);
            let newData = {
                name: newDate.getDate() + " " + monthNames[newDate.getMonth()],
                Active_user: Math.floor(Math.random() * 1000)
            }
            userData.push(newData);
            //console.log(newDate.getDate() + " " + monthNames[newDate.getMonth()]);

        }

        previousStartInterval.setDate(previousStartInterval.getDate() - 14);
        previousStartInterval.setHours(0, 0, 0, 0);

        previousEndInterval.setDate(previousEndInterval.getDate() - 7);
        previousEndInterval.setHours(23, 59, 0, 0);

        currentStartInterval.setDate(currentStartInterval.getDate() - 6);

        currentStartInterval.setHours(0, 0, 0, 0);
        currentEndInterval.setHours(23, 59, 0, 0);
    } else if (req.body.time == "month") {

        for (var i = 30; i >= 0; i--) {
            let newDate = nextweek(i);
            let newData = {
                name: newDate.getDate() + " " + monthNames[newDate.getMonth()],
                Active_user: Math.floor(Math.random() * 1000)
            }
            userData.push(newData);
            //console.log(newDate.getDate() + " " + monthNames[newDate.getMonth()]);

        }
        previousStartInterval.setDate(previousStartInterval.getDate() - 60);
        previousStartInterval.setHours(0, 0, 0, 0);

        previousEndInterval.setDate(previousEndInterval.getDate() - 30);
        previousEndInterval.setHours(23, 59, 0, 0);

        currentStartInterval.setDate(currentStartInterval.getDate() - 29);

        currentStartInterval.setHours(0, 0, 0, 0);
        currentEndInterval.setHours(23, 59, 0, 0);
    } else {
        for (var i = 11; i >= 0; i--) {
            let newDate = nextmonth(i);
            let newData = {
                name: monthNames[newDate.getMonth()] + "'" + newDate.getFullYear() % 2000,
                Active_user: Math.floor(Math.random() * 1000)
            }
            userData.push(newData);
            //console.log(newDate.getDate() + " " + monthNames[newDate.getMonth()]);

        }
        previousStartInterval.setDate(previousStartInterval.getDate() - 730);
        previousStartInterval.setHours(0, 0, 0, 0);

        previousEndInterval.setDate(previousEndInterval.getDate() - 365);
        previousEndInterval.setHours(23, 59, 0, 0);

        currentStartInterval.setDate(currentStartInterval.getDate() - 355);

        currentStartInterval.setHours(0, 0, 0, 0);
        currentEndInterval.setHours(23, 59, 0, 0);
    }

    //FIND NUMBER OF USERS 
    User.users.find({}, async function (err, foundUser) {
        if (err) {
            res.send({ message: 'error' });
        } else {
            for (var i = 0; i < foundUser.length; i++) {
                if (foundUser[i].createdAt >= previousStartInterval && foundUser[i].createdAt <= previousEndInterval) {
                    previousUsers++;
                }
                if (foundUser[i].createdAt >= currentStartInterval && foundUser[i].createdAt <= currentEndInterval) {
                    currentUsers++;
                }

            }
            if (previousUsers === currentUsers) {
                user_percentage = 0;
            } else
                if (previousUsers === 0) {
                    user_percentage = 100;
                } else {
                    user_percentage = ((currentUsers - previousUsers) / previousUsers) * 100;
                }
        }

        //FIND NUMBER OF SESSION
        userSession.find({}, async (err, foundSession) => {
            if (err) {
                res.send({ message: error });
            } else {
                for (var i = 0; i < foundSession.length; i++) {

                    if (foundSession[i].startTime >= previousStartInterval && foundSession[i].startTime <= previousEndInterval) {
                        previous_sessions++;
                        previous_session_duration += foundSession[i].totalTime;
                    }
                    if (foundSession[i].startTime >= currentStartInterval && foundSession[i].startTime <= currentEndInterval) {
                        current_sessions++;
                        current_session_duration += foundSession[i].totalTime;
                    }
                }
                if (previous_sessions === current_sessions) {
                    sesssion_percentage = 0;
                } else
                    if (previous_sessions === 0) {
                        sesssion_percentage = 100;
                    } else {
                        sesssion_percentage = ((current_sessions - previous_sessions) / previous_sessions) * 100;
                    }

                average_session_duration = (current_session_duration) / (current_sessions);
                average_session_duration = ((current_session_duration) / (60)).toFixed(0) + "min " + (current_session_duration) % (60) + "sec";

                //console.log(currentUsers + " " + previousUsers);
                // console.log(current_sessions + " " + previous_sessions);
                if (previous_session_duration === current_session_duration) {
                    session_duration_percentage = 0;
                } else
                    if (previous_session_duration === 0) {
                        session_duration_percentage = 100;
                    } else {
                        session_duration_percentage = ((current_session_duration - previous_session_duration) / previous_session_duration) * 100;
                    }
                res.send({
                    message: "Ok", info: {
                        noOfUser: foundUser.length,
                        userPercentage: user_percentage.toFixed(2),
                        current_sessions: current_sessions,
                        sesssion_percentage: sesssion_percentage.toFixed(2),
                        average_session_duration: average_session_duration,
                        session_duration_percentage: session_duration_percentage.toFixed(2),
                        userData: userData

                    }
                });
            }
        });

    });


}

const onlineUsers = async (req, res) => {
    var onlineUsers = 0;
    User.users.find({}, function (err, foundUser) {
        if (err) {
            res.status(301).json({ message: 'Error' });
        } else {
            for (var i = 0; i < foundUser.length; i++) {
                if (foundUser[i].online == true) {
                    onlineUsers++;
                }
            }
            res.status(200).json({ message: 'success', data: onlineUsers });
        }
    });
    const today = new Date();
    console.log(today);
    console.log(today.getHours());

    today.setDate(today.getHours() - 32);
    console.log(today.getHours());
    var twoHoursBefore = new Date();
    console.log(twoHoursBefore.getHours());
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 24);
    console.log(twoHoursBefore);
    res.status(200).json({ message: 'success' });
}

module.exports = {
    updateLastSession,
    findUserStatistics,
    onlineUsers,
    addNewSession
}



//how to call one api in another api
