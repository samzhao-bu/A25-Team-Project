const express = require('express');

const router = express.Router();
// import the model
const Model = require('../model/model');
// import api for converting pdf-to-docx
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
         
         convertapi.convert('docx', {File: filePath}, 'pdf').then(async (result) => {
            // ensure save the data to the database is executed only after the file conversion is complete and convertedFilePath is set
            const convertedFilePath = result.file.url;

            // Save to database
            const data = new Model({
                originalName: req.file.originalname,
                originalFormat: 'pdf',
                convertedFormat: 'docx',
                // Send the URL back to the client
                convertedFileUrl: convertedFilePath
            });

            // Save the record in the database
            await data.save();

            // Send the response to the frontend
            res.status(200).json({
                message: 'File converted successfully',
                data: data
             });  
             
             
            // Once saved, delete the original uploaded file
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting the uploaded file:', err);
                } else {
                     console.log('Uploaded file deleted successfully');
                }
            });   
        });

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