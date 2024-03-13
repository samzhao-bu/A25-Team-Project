const mongoose = require('mongoose');

// define the database struct
// may add more later
const dataShema = new mongoose.Schema({
    originalName: {
        required: true,
        type: string
    },
    convertedName: {
        required: true,
        type: string
    },
    originalFormat: {
        required: true,
        type: string
    },
    convertedFormat: {
        required: true,
        type: string
    }


})

module.exports = mongoose.model('Data', dataShema)