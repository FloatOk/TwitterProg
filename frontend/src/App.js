import React, { useState } from 'react';


import './App.css';

function XIcon() {
  return (
    <div>
      <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/x-social-media-black-icon.png" alt="X Icon" />
    </div>
  );
}

function App() {
  const [inputData, setInputData] = useState('');
  const [resultData, setResultData] = useState(null);

  document.body.style = 'background-image: linear-gradient(#829cd1, black)';
  document.body.style.minHeight = '100vh';
  const handleSubmit = async () => {
    const data = { data: inputData }; // The data you're sending

    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    setResultData(result);
  };

  return (
    <div class='body'>
    <div className="App">
      <div class='parent'>
        <div class='child'>
        <p><XIcon /></p>
        </div>
        <div class='child'>
        <input 
          type="text" 
          value={inputData} 
          onChange={(e) => setInputData(e.target.value)} 
          placeholder="Enter Username" 
        />
        <button onClick={handleSubmit}>Search Twitter User</button>
      
        {resultData && (
          <div>
            <h3>Prediction Result:</h3>
            <bb>{resultData}</bb> {/* Render the result from the backend */}
          </div>
        )}
        </div>
        </div>

        <h1>Twitter Bots and How to Spot Them</h1>
        <b1>A Twitter bot is any account that is accessed and used with some form of automation.<br></br>English that appears to be mistranslated, or has strange formatting<br></br>
Misrepresentations or misunderstanding of specific cultural knowledge <br></br>that would likely be known <br></br> if the tweeter was who they claim to be<br></br><br></br>
Based on location, is the time of day/night the account is active strange, <br></br> 
e.g. an account beginning to tweet, <br></br>based on their location in the world, at midnight and continuing to tweet <br></br> a dozen times stopping at 5:00am<br></br><br></br>
Reposting of the same textual information or images without<br></br> change to the content in many different places<br></br>
Time between release of tweets being closer together<br></br> than a user would typically be able to type<br></br>
IP correlation to the supposed geographical location<br></br> of the bot. This could be a giveaway that an <br></br>account is a bot, for example: 
bot claiming<br></br> to be American talking about American politics, but it’s in Russia.<br></br><br></br>
An account that follows a large number of other accounts, but has very few followers itself<br></br><br></br>
An abnormally large number of hashtags on posts
</b1>
      
    </div>
    </div>
  );
}


export default App;