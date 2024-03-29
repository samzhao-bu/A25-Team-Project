const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Please provide name!"],
      unique: [false, "name Exist"],
    },

    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
      },
    
    password: {
        type: String,
        required: [false, "Please provide a password!"],
        unique: false,
      },
    
      googleId: {
        type: String,
        required: false,
      },

      //differentiate between users who registered with an email/password and users who registered through Google.
      isGoogleAccount: {
        type: Boolean,
        required: true,
        default: false,
      },

})



module.exports = mongoose.model.Users || mongoose.model("Users", userSchema);