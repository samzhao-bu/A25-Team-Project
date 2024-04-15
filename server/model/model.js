const mongoose = require('mongoose');

// define the database struct
// may add more later
const dataSchema = new mongoose.Schema({
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'UserModel', 
    //     required: true
    // },

    originalName: {
        required: true,
        type: String
    },
   
    originalFormat: {
        required: true,
        type: String
    },
    convertedFormat: {
        required: true,
        type: String
    },
    convertedFileUrl: {
        required: true,
        type: String
    }


})

module.exports = mongoose.model('Data', dataSchema)