const express = require('express');
const app = express()
const PORT = process.env.PORT || 4000
const mongoose = require('mongoose');
const productModel = require('./product')
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const isAuthenticted = require('../isAuntheticated')
var channel,connection;

var order;

async function connectDB(){
    let res = await mongoose.connect('mongodb://localhost/product-service');
    if(res) console.log('product servie is connected to db')
}



app.use(express.json())

async function connect() {
    const amqpserver = "amqp://localhost:5672"
    connection = await amqp.connect(amqpserver);
    channel = await connection.createChannel()
    await channel.assertQueue('PRODUCT')
}
connect();

// create a new product

app.post('/product/create' , isAuthenticted.isAuthenticted , async(req,res) => {
    const {name,description,price} = req.body;
    const product = new productModel({
        name,
        description,
        price
    }) 
    await product.save()
    return res.json(product)
})

// User sends a list of product IDs to buy

app.post('/product/buy' , isAuthenticted.isAuthenticted , async (req,res) => {
    let newOrder;
    const {ids} = req.body;
    const products = await productModel.find( { _id : { $in : ids} } );
    channel.sendToQueue('ORDER',Buffer.from(JSON.stringify({
        products,
        userEmail:req.user.email,
    })))
    await channel.consume('PRODUCT',(data) => {
        console.log('consuming the ordered product')
        newOrder = JSON.parse(data.content)
        console.log(newOrder)
        channel.ack(data) 
    })
    if(newOrder){
        return res.json(newOrder);
    }
})

app.listen(PORT,() => {
    
    console.log('product servie at port',PORT)
    connectDB()
})