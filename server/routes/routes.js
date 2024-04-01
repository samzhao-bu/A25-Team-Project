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

const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const deepl = require('deepl-node');
const authKey = process.env['DEEPL_AUTH_KEY'];
const serverUrl = process.env['DEEPL_SERVER_URL'];
const translator = new deepl.Translator(authKey, { serverUrl: serverUrl });

const request = require('request');


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

router.post('/dltranslater', upload.single('file'), async (req, res) => {
  try {
  if (!req.file) {
      return res.status(400).send('No file uploaded.');
  }
  const filePath = req.file.path;
  const translatedFilePath = path.join(__dirname, '../downloads', `translated-${req.file.filename}`);
  const targetLang = req.body.targetLang;
  await translator.translateDocument(
    req.file.path,
    translatedFilePath,
    null,
    targetLang,
);
const filename = path.basename(translatedFilePath);
// const downloadUrl = `${req.protocol}://${req.get('host')}/downloads/${path.basename(translatedFilePath)}`;
res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
const readStream = fs.createReadStream(translatedFilePath);
readStream.pipe(res);
fs.unlink(filePath, (err) => { 
  if (err) {
      console.error('Error deleting the uploaded file:', err);
  } else {
       console.log('Uploaded file deleted successfully');
  }
});
fs.unlink(translatedFilePath, (err) => {
  if (err) {
    console.error('Error deleting the uploaded file:', err);
  } else {
     console.log('Downloaded file deleted successfully');
  }
});      

}catch (error) {
  console.error(error);
  res.status(500).send('Error during conversion');
}
})

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

  const { email, password } = request.body;
  
   // Validate email and password
   if (!email || !password) {
    return response.status(400).send({
      message: "Email and password are required",
    });
  }

    // ensure the email was not already registered
    User
        .findOne({ email: request.body.email })
        .then(user => {
          if (user) {
              return response.status(400).send({
                  message: "Email already exists"
              });
          }
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
            response.status(200).send({
              message: "Error creating user",
              error,
            });
          });
      })

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
    User
      .findOne({ email: request.body.email })
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
              process.env.JWT_TOKEN,
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


// Configure Passport to use Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            isGoogleAccount: true,
          });
        } else {
          if (!user.googleId) {
            user.googleId = profile.id;
            user.isGoogleAccount = true;
            await user.save();
        } else {
            user.isGoogleAccount = true;
            await user.save();
        }
        done(null, user);
        } 
      }catch (err) {
        done(err);
      }
    }
  ));

// Serialize and deserialize user instances to and from the session.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }
}));

// Initialize Passport and restore authentication state, if any, from the session.
router.use(passport.initialize())
router.use(passport.session())

// Route that initiates the Google OAuth flow
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

// Google OAuth callback route
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // On successful authentication, create a JWT for the user
    const token = jwt.sign(
      {
        userId: req.user._id,
        userEmail: req.user.email,
      },
      process.env.JWT_TOKEN, 
      { expiresIn: "24h" }
    );

    // Redirect to the frontend with the token
    // passing tokens via URL parameters
    // need to pass to auth
    res.redirect(`http://localhost:5173/auth/?token=${token}`);
  }
);


// Function to make a request to the text analysis API
const analyzeText = (filePath, callback) => {
  const options = {
      method: 'POST',
      url: 'https://text-analysis12.p.rapidapi.com/text-mining/api/v1.1',
      headers: {
          'content-type': 'multipart/form-data; boundary=---011000010111000001101001',
          'X-RapidAPI-Key': process.env.RAPID_API_KEY,
          'X-RapidAPI-Host': process.env.RAPID_API_HOST
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