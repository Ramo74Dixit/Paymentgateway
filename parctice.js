const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const nodemailer=require('nodemailer');
const crypto=require('crypto');
const jwt=require('jsonwebtoken');
const fs=require('fs')
// Initialize Express
const app = express();
app.use(bodyParser.json()); // For parsing JSON bodies

const jwtSecret="your_secret_key";

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/bcrypt-hasing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email:{type:String,required:true,unique:true},
  token:{type:String}
});

const User = mongoose.model('User', userSchema);
const transporter= nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:'ramodixit577@gmail.com',
    pass:"tgov igip gsjz ffeh" 
  }
})

const generateOTP = ()=>{
  const otp=crypto.randomInt(100000, 999999);
  return otp.toString();
}

const errorhandler= (err,req,res,next) => {
    console.error("Error :",err.message || err);
    res.status(err.status || 500).json({err:err.message || "Internal Server Error"})   
}
const sendWelcomeMail = async(email,username,otp)=>{
   try{
    await transporter.sendMail({
      from :"rikitakathuria50@gmail.com",
      to: email,
      subject:"Welcome to our Company Kodu !!",
      text:` Hi ${username}, Thank You for Joining and registering in our company. Your OTP is ${otp} . Kindly Don't share it.`
    })

    console.log("Mail Sent Successfully");

   }catch(error){
    console.error("Error sending in mail");
   }
}

const requestLogger = (req, res, next) => {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
    
    // Append the log message to new.txt
    fs.appendFile("new.txt", logMessage, (err) => {
        if (err) {
            console.error("Failed to write to file:", err);
        }
    });

    // Continue to the next middleware or route
    next();
};

app.use(requestLogger);
app.use(errorhandler)
// Signup Route

app.post('/signup',async (req,res,next)=>{
    const{username,password,email}=req.body;
    try{
       const existingUser=await User.findOne({username});
       if(existingUser){
        return res.status(400).json({error:"Bhai tu galt jagah aa gya"})
       }
       // hash password
       const saltRounds=10;
       const hashedPassword=await bcrypt.hash(password,saltRounds);
       // save this user databse
       const token=jwt.sign({userId:username},jwtSecret,{expiresIn:'24h'});
       console.log(token);
       const user=new User({username,password:hashedPassword,email,token})
       await user.save();
       const otp=generateOTP();
       await sendWelcomeMail(email,username,otp);
       res.status(200).json({message:"Aaap yha par jud gye hai "})
    }catch(error){
        next(error)
    }
})

app.post('/login',async(req,res)=>{
  const {username,password,token}=req.body;
  try{
    // checking for user existance
    const user=await User.findOne({username});
    if(!user){
      return res.status(404).json({eror:"User is not registered"});
    }
    // comparing passwords
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.status(401).json({error:"Invalid Password"});
    }

    if(user.token!==token){
      return res.status(403).json({error:"unauthorized token,login not allowed"});
    }
    res.status(200).json({message:"Login Successfully"})
  }catch(error){
    res.status(500).json("error:An err occured",error.message)
  }
})

app.get('/users',async(req,res)=>{
  try{
    const users=await User.find({},{password:0})
    res.status(200).json(users);

  }catch(err){
    res.status(500).json({eror:"An eror occured"})
  }
})
app.put('/users/:id',async(req,res)=>{
  const {id}=req.params;
  const {username,password}=req.body;
  try{
      const saltRounds=10;
      const hashedPassword= await bcrypt.hash(password,saltRounds);
      // Update the user 
      const updatedUser= await User.findByIdAndUpdate(
        id,
        {username,password:hashedPassword},
        {new:true} // return updated document
       )
      if(!updatedUser){
        return res.status(404).json({error:"User not found"})
      }
      res.status(200).json({message:"User Updated Succesfully"});


  }catch(error){
      res.status(500).json({message:"Error occured",error});
  }
})
app.patch('/users/:id',async(req,res)=>{
  const {id}=req.params;
  const {username,password}=req.body;
  try{
     const updateData={};
     if(password){
      const saltRounds=10;
      updateData.password=await bcrypt.hash(password,saltRounds);
     }
     if(username){
      updateData.username=username;
     }
     // update user 
     const updatedUser=await User.findByIdAndUpdate(
      id,
      updateData,
      {new:true}
     )
     if(!updatedUser){
      return res.status(404).json({error:"User not updated Something went wrong"});
     }
     res.status(200).json({message:"User Updated Successfully"});
  }catch(error){
    res.status(500).json({message:"Error occured",error});
  }
})
const PORT=5004;
app.listen(PORT,()=>{
    console.log("Server Started Successfully");
})