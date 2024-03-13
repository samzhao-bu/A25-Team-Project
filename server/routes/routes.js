const express = require('express');

const router = express.Router();
// import the model
const Model = require('../model/model');
// import api for converting file
const ConvertApi = require('convertapi-js');
// for handling file uploads
const multer = require('multer');

// ConvertAPI authentication
const convertApi = ConvertApi.auth('sqnUSLzN2sMxQu0v');
// Configure multer
const upload = multer({ dest: 'uploads/' });

//Post Method
router.post('/pdf-to-docx', upload.single('file'), async (req, res) => {
    try {
        let params = convertApi.createParams();
        params.add('File', req.file.path);
        // use api call
        let result = await convertApi.convert('pdf', 'docx', params);

        const data = new Model({
            originalName: req.file.originalname,
            convertedName: result.file.filename, 
            originalFormat: 'pdf',
            convertedFormat: 'docx'
        });

        // Save the record in the database
        await fileRecord.save();

        res.download(result.file.filepath);
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

module.exports = router;