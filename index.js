const connectToMongo = require('./db');
const express = require('express')
connectToMongo();


const app = express()
var cors = require('cors')
const port = 5000
const axios = require('axios');



app.use(cors()) // To allow browser to use api to make changes and solve cors error
app.use(express.json()) // when u want to use req.body then u need to have a middleware here these middleware is app.use i.e when u want to use console.log(req.body)

app.get('/', (req, res) => {
  res.send('These is the server of Telehealth')
})
 
// Available routes
app.use('/api/user', require('./routes/user'))
app.use('/api/doctor', require('./routes/doctor'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/blog', require('./routes/blog'))

// mental health
app.use('/api/todo', require('./routes/todo'))
app.use('/api/note', require('./routes/note'))
app.use('/api/sentiments', require('./routes/sentiments'))
app.use('/api/assesment', require('./routes/assesment'))


const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Addinfo = require('./models/Addinfo')
const Routine = require('./models/Routine')
const fetchuser = require('./middleware/fetchuser');


app.post('/genapi', fetchuser,  async (req, res) => {
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



app.get('/getuserdetails', fetchuser, async (req, res) => {
  try {
    console.log(req.user.id);
    
    // Fetch the latest entry from Addinfo and Routine for the given user
    const addinfodata = await Addinfo.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    const routinedata = await Routine.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    
    // Combine the data into a single object
    const userDetails = {
      addinfodata,
      routinedata
    };

    // Send the combined data as the response
    res.send(userDetails);
  } 
  catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error occurred");
  }
});


app.listen(port, () => {
  console.log(`Backend app listening on port ${port}`)
})
