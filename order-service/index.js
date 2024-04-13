const express = require('express')
const app = express()
const amqp = require('amqplib');
const orderModel = require('./order');
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose');
const order = require('./order');
var channel,connection;

async function connectDB(){
    let res = await mongoose.connect('mongodb://localhost/order-service');
    if(res) console.log('order servie is connected to db')
}


async function connect() {
    const amqpserver = "amqp://localhost:5672"
    connection = await amqp.connect(amqpserver);
    channel = await connection.createChannel()
    await channel.assertQueue('ORDER');
}

async function createOrder(products,userEmail) {
    let total = 0;
    for (let i = 0; i < products.length; i++) {
        total += products[i].price
    }
    const newOrder = new orderModel({
        products,
        User:userEmail,
        total,
    })
    await newOrder.save()
    return newOrder;
}

connect().then(() => {
   
    channel.consume('ORDER',async (data) => {
        const {products,userEmail} = JSON.parse(data.content);
        if(products && userEmail){
            console.log('consuming order queue');
            const newOrder = await createOrder(products,userEmail);
            channel.sendToQueue('PRODUCT',
                Buffer.from(JSON.stringify({ newOrder }))
            )
            channel.ack(data) 
        }   
    })
    
});

app.use(express.json());


app.listen(PORT,() => {
    console.log('ordre service is running on port:',PORT);
    connectDB()
})