const mongoose = require('mongoose');
const {Schema} = mongoose

const AddinfoSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },  
    age:{
        type: Number,
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    maritalstatus:{
        type: String,
        required: true
    },
    profession:{
        type: String,
        required: true
    },
    about:{
        type: String,
        required: true
    },

    date:{
        type: Date,
        default: Date.now
    },


});
module.exports = mongoose.model('addinfo', AddinfoSchema);   

