const express = require('express');
const axios = require('axios');
const cors = require('cors')
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;



app.use(express.json());
app.use(cors());


const getOpenAIResponse = async (prompt) => {
  const apiKey = process.env.OPENAI_API_KEY;
  

  const data = {
    model: "gpt-4", // or "gpt-4" if using GPT-4
    messages: [{ role: 'user', content: "You give a rating from 0 to 50 on"
      + "how likely the name (if the promt starts with 'Name: ') or" 
      + "bio (if the prompt starts with 'Bio: ') was made by a bot."
      + "Increase your rating by at least 10 if it seems hyperpartisan, and decrease"
      + "your rating if the name has a notable figure." 
      + "Do not explain your reasoning, only give the number"
      + "Add an extra 20 points if you think this could have been"
       + "written by a disinformation bot, still only give a number and"
      + "nothing else. Additionally, if the prompt start with 'Fame: ',"
      + "just give either a 1 if the name is a real life famous person or a 0 otherwise, without reasoning:" + prompt }],
    max_tokens: 100, // Adjust token limit as needed
  };



  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    throw new Error('OpenAI API request failed');
  }
};

// Neural network prediction
app.post('/predict', (req, res) => {
  const inputData = req.body.data; // Inp from frontend

  const python = spawn('python', ['neural_net.py']);
  python.stdin.write(JSON.stringify({ data: inputData }));
  python.stdin.end();

  python.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  python.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data.toString()}`);  // Log Python's print() output to the console
  });



  let result = '';
  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  python.on('close', (code) => {
    if (code === 0) {
      try {
        res.json(JSON.parse(result)); // Returns the result to the frontend
      } catch (error) {
        res.status(500).json({ error: 'Invalid JSON response from Python script' });
      }
    } else {
      res.status(500).json({ error: 'User does not exist' });
    }
  });

});

app.post('/ask-openai', async (req, res) => {
  try {
    console.log("Received request with prompt: ", req.body.prompt);  // Log the prompt
    const result = await getOpenAIResponse(req.body.prompt);
    console.log("Sending response: ", result);  // Log the response before sending
    res.json({ response: result });
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).json({ error: 'Failed to process the request' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});