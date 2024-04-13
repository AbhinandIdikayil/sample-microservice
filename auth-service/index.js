const express = require('express');
const app = express()
const PORT = process.env.POTT || 3000
const mongoose = require('mongoose');
const userModel = require('./user')
const jwt = require('jsonwebtoken');

async function connectDB(){
    let res = await mongoose.connect('mongodb://localhost/auth-service');
    if(res) console.log('auth servie is connected to db')
}



app.use(express.json())


app.post('/auth/login',async (req,res) => {
    const {email,password} = req.body;
    let user = await userModel.findOne({email});
    if(user){
        if(password !== user.password){
            return res.json('Password is incorrect')
        }
        const payload = {
            email,
            name:user.name
        };
        jwt.sign(payload,'secret',(err,token) => {
            if(err) return console.log(err)
            else return res.json({token:token})
        })
    }else{

    }
})

app.post('/auth/register',async(req,res) => {
    const {email,name,password} = req.body
    if(!email || !name || !password) return res.json('Fill out the form')
    let existing = await userModel.findOne({email});
    if(existing){
        return res.json({'message':'user already exists'});
    }else{  
        const newUser  = new userModel({
            name:name,
            email:email,
            password:password
        })
        await newUser.save()
        return res.json({newUser})
    }
})

app.listen(PORT,() => {
    console.log('auth-servie at port',PORT)
    connectDB()
})