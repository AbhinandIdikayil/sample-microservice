const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    products:[
        {
            product_id:String,
        }
    ],
    User:String,
    total:Number,
    created_at:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model('order',orderSchema);