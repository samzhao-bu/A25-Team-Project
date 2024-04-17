const express = require('express');

const router = express.Router();
// import the model
const Model = require('../model/model');
// import model for user
const User = require("../model/userModel");
// import api for converting pdf-to-docx
var convertapi = require('convertapi')(process.env.COVERT_API_TOKEN);
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

//Post Method for pdf-to-docx--------------------------------------------------------------------------------
router.post('/pdf-to-docx', upload.single('file'), async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // if (!req.user) {
        //   return res.status(401).json({ message: 'Not authenticated' });
        // }

        const filePath = req.file.path;

         // Perform the conversion
         
         convertapi
            .convert('docx', {File: filePath}, 'pdf')
            .then(async (result) => {
            // ensure save the data to the database is executed only after the file conversion is complete and convertedFilePath is set
            const convertedFilePath = result.file.url;

            // Save to database
            const data = new Model({
                // userId: req.user._id,
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


// post endpoint for register-----------------------------------------------------------------------------------------------
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


// post endpoint for login-------------------------------------------------------------------------------------------------
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
  

// // free endpoint
// router.get("/free-endpoint", (request, response) => {
//   response.json({ message: "You are free to access me anytime" });
// });

// // authentication endpoint
// router.get("/auth-endpoint", auth, (request, response) => {
//   response.json({ message: "You are authorized to access me" });
// });


// Configure Passport to use Google OAuth-------------------------------------------------------------------------------
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


// Function to analyze text---------------------------------------------------------------------------------------------------
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

// Function to summarize text
const summarizeText = (textExtractionOutput, callback) => {
  const options = {
    method: 'POST',
    url: 'https://text-analysis12.p.rapidapi.com/summarize-text/api/v1.1',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.RAPID_API_KEY,
      'X-RapidAPI-Host': process.env.RAPID_API_HOST
    },
    body: {
      language: 'english',
      summary_percent: 10,
      text: textExtractionOutput
    },
    json: true
  }; 

  request(options, callback);
};

// Function to save text to file
const saveTextToFile = (text, callback) => {
  const fileName = `summary_${Date.now()}.txt`;
  const filePath = path.join(__dirname, '..', 'downloads', fileName);

  fs.writeFile(filePath, text, (err) => {
    if (err) callback(err, null);
    else callback(null, filePath);
  });

   // clean download file after 60s
      
   setTimeout(() => {
     fs.unlink(filePath, (err) => {
         if (err) {
             console.error("Error deleting file:", filePath, err);
         } else {
             console.log("File deleted successfully:", filePath);
         }
     });
 }, 6000);
};

// POST Method for text analysis and summarization------------------------------------------------------------------------------
router.post('/text-analysis', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;

    analyzeText(filePath, async (error, response, body) => {
      if (error) {
        return res.status(500).send('Error during text analysis');
      }

      // the text extracted from analyzeText
      const parsedBody = JSON.parse(body);
      const textExtractionOutput = parsedBody.text;

      await summarizeText(textExtractionOutput, async (summarizationError, summaryResponse, summaryBody) => {
        if (summarizationError) {
          return res.status(500).send('Error during text summarization');
        }

        //console.log('Summary body:', summaryBody.summary);

        await saveTextToFile(summaryBody.summary, (fileSaveError, savedFilePath) => {
          if (fileSaveError) {
            return res.status(500).send('Error saving the file');
          }

          const downloadUrl = `${req.protocol}://${req.get('host')}/downloads/${path.basename(savedFilePath)}`;
          res.status(200).send({ downloadUrl });
        });
      });

      // clean uploaded file
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
    res.status(500).send('Error during text analysis');
  }
});


// router.use('*', (req, res) => {
//   res.redirect('/'); // Redirect user to the homepage
// });

const authenticateWithJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is sent as a Bearer token
  if (!token) {
      return res.status(401).send('No token provided');
  }

  jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
      if (err) {
          return res.status(401).send('Invalid token');
      }
      req.user = decoded; // Set the decoded user to req.user
      console.log(req.user)
      next();
  });
};

// Endpoint to get user name using JWT
router.get('/get-user-name', authenticateWithJWT, async(req, res) => {
  if (req.user) {
    const userId = req.user.userId; // Get the user ID from the decoded token

    // Query the database to find the user by ID
    const user = await User.findById(userId);

    if (user) {
      res.json({ name: user.name }); 
    } else {
      res.status(404).send('User not found');
    }
  } else {
    res.status(401).send('Unauthorized');
  }
});


router.get('/test', (req, res) => {
  res.send('Test endpoint');
});




module.exports = router;