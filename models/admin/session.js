const mongoose = require('mongoose');
const conn = require('../../config/db');

const userSessionSchema = new mongoose.Schema({
    userId: String,
    sessionId: String,
    startTime: Date,
    endTime: Date,
    totalTime: Number
});

const userSession = conn.model('usersessions', userSessionSchema);


module.exports = userSession;