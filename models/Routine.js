const mongoose = require('mongoose');
const {Schema} = mongoose

const RoutineSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },  
    mood:{
        type: String,
        required: true
    },
    feelsnow:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }


});
module.exports = mongoose.model('routine', RoutineSchema);   

