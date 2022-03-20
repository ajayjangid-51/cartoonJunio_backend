 const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost:${process.env.DB_PORT}/${process.env.DATABASE}`).then(con=> {
    console.log("connected DB");
}).catch(err=>{
    console.log('error', err);
});

module.exports = mongoose;