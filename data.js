const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const nodemailer=require('nodemailer');
const crypto=require('crypto')
// Initialize Express
const app = express();
app.use(bodyParser.json()); // For parsing JSON bodies

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/bcrypt-hasing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email:{type:String,required:true,unique:true}
});

const User = mongoose.model('User', userSchema);

// setup nodemailer

const transporter= nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:'ramodixit577@gmail.com',
    pass:"tgov igip gsjz ffeh"
  }
})

const generateOTP = ()=>{
  // crypto.randomint(1000000,99999)
  const otp=crypto.randomInt(1000000,99999);
  return otp.toString();
}

const sendWelcomeMail = async(email,username,otp)=>{
   try{
    await transporter.sendMail({
      from :"ramodixit577@gmail.com",
      to: email,
      subject:"Welcome to our Company Kodu !!",
      text:` Hi ${username}, Thank You for Joining and registering in our company. Your OTP is ${otp} . Kindly Don't share it.`
    })

    console.log("Mail Sent Successfully");

   }catch(error){
    console.error("Error sending in mail");
   }
}
// Signup Route

app.post('/signup',async (req,res)=>{
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
       const user=new User({username,password:hashedPassword,email})
       await user.save();
       const otp=generateOTP();
       await sendWelcomeMail(email,username,otp);
       res.status(200).json({message:"Aaap yha par jud gye hai "})
    }catch(error){
       return res.status(500).json("Error is generated ",error);
    }
})

app.post('/login',async(req,res)=>{
  const {username,password}=req.body;
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
    res.status(200).json({message:"Login Successfuyll"})
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
// put aur patch me difference 
// partial updation
// username
// password
// email

// specific userId 
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
const PORT=5000;
app.listen(PORT,()=>{
    console.log("Server Started Successfully");
})