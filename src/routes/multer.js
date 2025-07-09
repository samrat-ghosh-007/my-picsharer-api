// const multer=require('multer');
// const {v4: uuidv4} = require('uuid');
// const path=require('path');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/images/uploads')
//   },
//   filename: function (req, file, cb) {
//     const uniquename=uuidv4();
//     cb(null, uniquename+path.extname(file.originalname));
//   }
// })

// const upload = multer({ storage: storage })

// module.exports=upload;

const multer = require('multer');
 const { v4: uuidv4 } = require('uuid');
 const path = require('path');
 const { CloudinaryStorage } = require('multer-storage-cloudinary');
 const cloudinary = require('./cloudinary');   // <‑‑ path to file above

 const storage = new CloudinaryStorage({
   cloudinary,
   params: async (req, file) => ({
    folder: 'pinterest-clone',                 // logical folder in Cloudinary
     public_id: uuidv4(),                       // keep your UUID pattern
     format: path.extname(file.originalname).slice(1), // jpg | png | webp …
     transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
   }),
 });
const upload = multer({ storage });
 module.exports = upload;
 
