const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    name:String,
    email:String,
    password:String,
    created_at:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model('user',userSchema)