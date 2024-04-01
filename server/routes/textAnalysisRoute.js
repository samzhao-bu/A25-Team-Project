const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const convertapi = require('convertapi')('sqnUSLzN2sMxQu0v');
const Model = require('../model/model');
const User = require("../model/userModel");

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

// Function to make a request to the text analysis API
const analyzeText = (filePath, callback) => {
    const options = {
        method: 'POST',
        url: 'https://text-analysis12.p.rapidapi.com/text-mining/api/v1.1',
        headers: {
            'content-type': 'multipart/form-data; boundary=---011000010111000001101001',
            'X-RapidAPI-Key': '3e189d719dmsh84d5f6776b5d9fep1eaceejsn42b7fc9339aa',
            'X-RapidAPI-Host': 'text-analysis12.p.rapidapi.com'
        },
        formData: {
            input_file: fs.createReadStream(filePath),
            language: 'english'
        }
    };

    request(options, callback);
};

// Post Method for text analysis
router.post('/text-analysis', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const filePath = req.file.path;

        // Perform text analysis
        analyzeText(filePath, (error, response, body) => {
            if (error) {
                return res.status(500).send('Error during text analysis');
            }

            // Once analysis is done, delete the uploaded file
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting the uploaded file:', err);
                } else {
                    console.log('Uploaded file deleted successfully');
                }
            });

            // Send the response to the frontend
            res.status(response.statusCode).send(body);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during text analysis');
    }
});

module.exports = router;
