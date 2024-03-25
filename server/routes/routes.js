const express = require('express');

const router = express.Router();
// import the model
const Model = require('../model/model');
// import model for user
const User = require("../model/userModel");
// import api for converting pdf-to-docx
var convertapi = require('convertapi')('sqnUSLzN2sMxQu0v');
// for handling file uploads
const multer = require('multer');
// for handling file dir
const path = require('path');
// for handling file delete
const fs = require('fs');
// for hashing hash the password
const bcrypt = require("bcrypt");
// for generating token
const jwt = require("jsonwebtoken");
const auth = require("./auth");


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


//Post Method for pdf-to-docx
router.post('/pdf-to-docx', upload.single('file'), async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const filePath = req.file.path;

         // Perform the conversion
         
         convertapi
            .convert('docx', {File: filePath}, 'pdf')
            .then(async (result) => {
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


// post endpoint for register
router.post("/register", (request, response) => {
    // hash the password
    bcrypt
      .hash(request.body.password, 10)
      .then((hashedPassword) => {
        // create a new user instance and collect the data
        const user = new User({
          name: request.body.name,
          email: request.body.email,
          password: hashedPassword,
        });
  
        // save the new user
        user
          .save()
          // return success if the new user is added to the database successfully
          .then((result) => {
            response.status(200).send({
              message: "User Created Successfully",
              result,
            });
          })
          // catch error if the new user wasn't added successfully to the database
          .catch((error) => {
            response.status(500).send({
              message: "Error creating user",
              error,
            });
          });
      })
      // catch error if the password hash isn't successful
      .catch((e) => {
        response.status(500).send({
          message: "Password was not hashed successfully",
          e,
        });
      });
});


// post endpoint for login
router.post("/login", (request, response) => {
    // check if email exists
    User.findOne({ email: request.body.email })
  
      // if email exists
      .then((user) => {
        // compare the password entered and the hashed password found
        bcrypt
          .compare(request.body.password, user.password)
  
          // if the passwords match
          .then((passwordCheck) => {
  
            // check if password matches
            if(!passwordCheck) {
              return response.status(400).send({
                message: "Passwords does not match",
                error,
              });
            }
  
            //   create JWT token
            const token = jwt.sign(
              {
                userId: user._id,
                userEmail: user.email,
              },
              "RANDOM-TOKEN",
              { expiresIn: "24h" }
            );
  
            //   return success response
            response.status(200).send({
              message: "Login Successful",
              email: user.email,
              token,
            });
          })
          // catch error if password does not match
          .catch((error) => {
            response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          });
      })
      // catch error if email does not exist
      .catch((e) => {
        response.status(404).send({
          message: "Email not found",
          e,
        });
      });
  });
  

// free endpoint
router.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
router.get("/auth-endpoint", auth, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});




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