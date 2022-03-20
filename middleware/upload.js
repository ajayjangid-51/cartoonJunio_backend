const util = require("util");
const Multer = require("multer");

// let processFile = Multer({
//   storage: Multer.memoryStorage()
// }).single("file");

// let processFileMiddleware = util.promisify(processFile);
// module.exports = processFileMiddleware;

const uploadImage = Multer({
  storage: Multer.memoryStorage(),
  fileFilter: ((req, file, callback)=>{
     // if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == "application/"){
          callback(null, true);
      // }else{
      //     console.log("only png and jpg files are allowed!");
      //     callback(null, false);
      // }
  })
});

module.exports = {uploadImage};