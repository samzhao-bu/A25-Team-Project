const mongoose = require('mongoose');

// define the database struct
// may add more later
const dataShema = new mongoose.Schema({
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
    }


})

module.exports = mongoose.model('Data', dataShema)