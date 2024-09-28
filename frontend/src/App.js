import React, { useState } from 'react';


import './App.css';

function App() {
  const [inputData, setInputData] = useState('');

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
    console.log(result); // The prediction response from the backend
  };

  // HTML for the actual web page
  return (
    <div className="App">
      <div>
      <input 
        type="text" 
        value={inputData} 
        onChange={(e) => setInputData(e.target.value)} 
        placeholder="Enter data" 
      />
      <button onClick={handleSubmit}>Search Twitter User</button>
    </div>
    </div>
  );
}

export default App;
