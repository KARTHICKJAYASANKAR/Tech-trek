const express = require('express');
const router = express.Router();
const path = require('path');
const secretKey ='akdaknafjeofhefijeofjnweofj9r840823348n2r2';
const User = require('./model/User');
const middleware = require('./middleware');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




router.get("/" , (req,res)=>{
    res.send("Welcome to the API");
})

router.post("/signup" , async(req,res)=>{

    try{
        const { name,email,password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ "message": "Enter all details" });
        }
        const encryptedPassword = await bcrypt.hash(password, 12); 
        const newUser = new User({
            name: name,
            email: email,
            password: encryptedPassword
        });
        const user = await newUser.save();
        if (user) {
            console.log(user);
            const token =  jwt.sign({_id : user._id} , secretKey , {expiresIn:'1d'});
            res.send([user._id , token] );
        } else {
            res.send("something went wrong");
        }
    }
    catch(e){
        console.log(e);
        res.status(500).send("Internal Server Error");
    }

});


router.post("/login" , async(req,res)=>{
    console.log("login API fetched..");
    const { email,password } = req.body;
    if(!email || !password)
    res.status(400).send("Enter all required fields");
    const user = await User.findOne({email:email});
    if(!user){
        return res.status(402).send(false);
    }
    const doMatch = await bcrypt.compare(password , user.password);
    if(doMatch){
        const token =  jwt.sign({_id : user._id} , secretKey , {expiresIn:'1d'});
        res.send([user._id , token] );
    }
    else{
        res.status(402).send(false);
    }
})



router.get('/fetchhome' , middleware ,async(req,res)=>{
    try
    {
        const user = await User.find();
        res.send(user);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send("Internal server error");
    }
})





module.exports = router;