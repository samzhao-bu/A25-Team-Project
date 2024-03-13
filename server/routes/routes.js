const express = require('express');

const router = express.Router();
// import the model
const Model = require('../model/model');
// import api for converting file
var convertapi = require('convertapi')('sqnUSLzN2sMxQu0v');
// for handling file uploads
const multer = require('multer');
// for handling file dir
const path = require('path');
// for handling file delete
const fs = require('fs');



// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Set the destination folder
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


//Post Method
router.post('/pdf-to-docx', upload.single('file'), async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const filePath = req.file.path;
         // Perform the conversion
         
         convertapi.convert('docx', {
            File: filePath
        }, 'pdf').then(function(result) {
            // get converted file url
            console.log("Converted file url: " + result.file.url);
           // converted = result.files[0].fileInfo.FileName;
            // save to file
            result.saveFiles('./temp/').then(() => {
                // Once saved, delete the original uploaded file
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting the uploaded file:', err);
                    } else {
                        console.log('Uploaded file deleted successfully');
                    }
                });
            });
        });


        const data = new Model({
            originalName: req.file.originalname,
            originalFormat: 'pdf',
            convertedFormat: 'docx'
        });


        // Save the record in the database
        await data.save();

        res.status(200).json(data);
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during conversion');
    }
    
})

//Get all Method
router.get('/getAll', (req, res) => {
    res.send('Get All API')
})

//Get by ID Method
router.get('/getOne/:id', (req, res) => {
    res.send('Get by ID API')
})

//Update by ID Method
router.patch('/update/:id', (req, res) => {
    res.send('Update by ID API')
})

//Delete by ID Method
router.delete('/delete/:id', (req, res) => {
    res.send('Delete by ID API')
})

router.get('/test', (req, res) => {
    res.send('Test route is working');
  });

module.exports = router;