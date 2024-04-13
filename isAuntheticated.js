const jwt = require('jsonwebtoken');

exports.isAuthenticted = async (req,res,next) => {
    let token = req.headers['authorization'].split(' ')[1];
    jwt.verify(token,'secret',(err,user) => {
        if(err){
            return res.json({message:err})
        }else{
            req.user = user;
            next();
        }
    })  
}   

