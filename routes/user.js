const express = require('express')
const User = require('../models/User')
const Updateuser = require('../models/user_medi_info/UserInfo')
const Updateuserdeases = require('../models/user_medi_info/OldMedi_info')
const Addinfo = require('../models/Addinfo')
const Routine = require('../models/Routine')
const router = require('express').Router();
const {body, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = 'masknxanxlanla';
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');


const validate = [
    body('name', 'Enter a valid name').isLength({min:3}),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password must be atleast 5 characters and alphanumeric').isLength({min:5}).isAlphanumeric(),
]


// Route 1 to create user
router.post('/', validate, async (req, res) =>{
    let success = false
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(404).json({success, error:"Enter a strong password", errors: errors.array()})
    }
    
    try {
            // check wheather user exist!!
            let user = await User.findOne({email: req.body.email});
            if(user){
        return res.status(400).json({success, error: "sorry user with these email exist"})
    }
    else{
        const salt = await bcrypt.genSalt(10);
        hashpassword = await bcrypt.hash(req.body.password, salt)
        user = await User.create({
            name : req.body.name,
            email : req.body.email,
            password : hashpassword
        })
        const data = {
            user:{
                id: user.id
            }
        }
        const jwtdata = jwt.sign(data, JWT_SECRET);
        success = true
        res.json({success, jwtdata})
    }
    
}    
    
    catch (error) {
        console.log(error.message)
        res.status(500).send("Some error occured")
    }
    
    
})


// Authentication a user and his password
// Route 2 to authenticate user

router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password cannont be blank').exists()], 
    async (req, res) =>{
        let success = false
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(404).json({errors: errors.array()})
        }

        const{email, password} = req.body;
        try {
            const user = await User.findOne({email});
            if(!user){
                return res.status(400).json({success, error: "Please try to login with correct cridentials"})
            }
            const passwordcompare = await bcrypt.compare(password, user.password);
            if(!passwordcompare){
                return res.status(400).json({success, error: "Please try to login with correct cridentials"})
            }
            
        const data = {
            user:{
                id: user.id
            }
        }
        const jwtdata = jwt.sign(data, JWT_SECRET);
        success = true
        res.json({success, jwtdata})
        } 
        
           
        catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server error occured")
    }
    }
    )




    // Route to update user profile
    router.post('/updateuser', fetchuser, async (req, res) =>{
        
        try {

            const user = await Updateuser.create({
                user: req.user.id,
                bloodgroup : req.body.bloodgroup,
                number : req.body.number,
                age : req.body.age,
                gender : req.body.gender
            })
            
            success = true
            res.json({success})
        
        
    }    
        
        catch (error) {
            console.log(error.message)
            res.status(500).send("Some error occured")
        }
        
        
    })

  // Route to update user old deases
  router.post('/addinfo', fetchuser, async (req, res) =>{
    try {

        const user = await Addinfo.create({
            user: req.user.id,
            age : req.body.age,
            gender : req.body.gender,
            maritalstatus : req.body.maritalstatus,
            profession : req.body.profession,
            about : req.body.about,
        })
        
        success = true
        res.json({success})
    
    
}    
    
    catch (error) {
        console.log(error.message)
        res.status(500).send("Some error occured")
    }
    
    
})
  router.post('/routine', fetchuser, async (req, res) =>{
    try {

        const user = await Routine.create({
            user: req.user.id,
            mood : req.body.mood,
            feelsnow : req.body.feelsnow
        })
        
        success = true
        res.json({success})
    
    
}    
    
    catch (error) {
        console.log(error.message)
        res.status(500).send("Some error occured")
    }
    
    
})


    // Route 3 to get user details


    router.post('/getuser', fetchuser,async (req, res) =>{
        try {
             userId = req.user.id;
            const user = await User.findById(userId).select("-password")
            res.send(user)
        } 
    
        catch (error) {
            console.log(error.message)
            res.status(500).send("Internal server error occured")
        }
        
    })



    router.post('/genapi', fetchuser,  async (req, res) => {
        async function run() {
          console.log(req.user.id)
          console.log(req.user.id);
          
          
          const addinfodata = await Addinfo.findOne({ user: req.user.id }).sort({ _id: -1 });
          const routinedata = await Routine.findOne({ user: req.user.id }).sort({ _id: -1 });
          
          const userDetails = {
            addinfodata,
            routinedata
          };
          
      
          age = userDetails.addinfodata.age
          gender = userDetails.addinfodata.gender
          maritalstatus = userDetails.addinfodata.maritalstatus
          profession = userDetails.addinfodata.profession
          mood = userDetails.routinedata.mood
          feelsnow = userDetails.routinedata.feelsnow
          console.log(age,
            gender,
            maritalstatus,
            profession,
            mood,
            feelsnow)
      
          const genAI = new GoogleGenerativeAI('AIzaSyB4EdSEyLCrd8vKWVYN2vB_O0uiSQsn7U8');
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const prompt = `
          I have a set of personal details that include age, gender, marital status, profession, current mood, and feelings right now. Based on this information, please perform a sentiment analysis and classify the emotions into one of the following categories: HAPPY, SAD, ANGRY, ENVY, FRUSTRATED, or NEUTRAL.
          
          Here are the details:
          
          - Age: ${age}
          - Gender: ${gender}
          - Marital Status: ${maritalstatus}
          - Profession: ${profession}
          - Current Mood: ${mood}
          - Current Feelings: ${feelsnow}
          
          Please analyze this information and provide the most accurate emotional classification from the categories listed above.
          Note that i only want respnse as : HAPPY, SAD, ANGRY, ENVY, FRUSTRATED, or NEUTRAL.  no need to specify any reason or anything else 
          By default the answer will be NEUTRAL if you are not able to classify it in any of the categories.
          `;
          
          
          try {
            const result = await model.generateContent([prompt]);
            return result.response.text();
          } catch (error) {
            console.error('Error generating content:', error);
            throw error;
          }
        }
        
        try {
          const responseText = await run();
          res.send(responseText);
        } catch (error) {
          res.status(500).send('An error occurred while generating content');
        }
      });
      
      


module.exports = router