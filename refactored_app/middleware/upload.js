import multer from 'multer';
import path from 'path';

// Set up disk storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Files are dynamically uploaded to the public/img/Q directory 
        cb(null, "./public/img/Q");
    },
    filename: (req, file, cb) => {
        console.log('Multer processing file:', file.originalname);
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

export default upload;
