import multer from 'multer';

// creation of disk storage configuration
// const storage =  multer.diskStorage({
//     filename: function(req,file,callback){
//         callback(null,file.originalname);

//     }
// })

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "uploads/"); // Create this folder
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + "-" + file.originalname);
    }
});

// Creation of an instance of this diskstorage

const upload = multer({storage});

export default upload;