import sys
import json
import os
import math
import numpy as np
import requests
import asyncio
from scrapfly import ScrapeConfig, ScrapflyClient
from playwright.sync_api import sync_playwright
import torch
from dotenv import load_dotenv
import torch.nn as nn
import torch.optim as optim

load_dotenv()
TOKEN = ScrapflyClient(os.getenv('SCRAP_TOKEN'))


def call_openai_from_backend(prompt):
    url = 'http://localhost:5000/ask-openai'  # Your Express server endpoint
    headers = {
        'Content-Type': 'application/json'
    }
    data = {
        'prompt': prompt
    }

    try:
        # Make a POST request to the backend with the prompt
        response = requests.post(url, headers=headers, data=json.dumps(data))

        if response.status_code == 200:
            return response.json()['response']  # Extract the OpenAI response
        else:
            print(f"Error: Received status code {response.status_code}")
            return None
    except Exception as e:
        print(f"Error making request to backend: {e}")
        return None


class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(10, 50)
        self.fc2 = nn.Linear(50, 1)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x


async def scrape_tweet(url: str) -> dict:
    """
    Scrape a X.com profile details e.g.: https://x.com/Scrapfly_dev
    """
    url = "https://x.com/" + url

    result = await TOKEN.async_scrape(ScrapeConfig(
        url, 
        render_js=True,  # enable headless browser
        wait_for_selector="[data-testid='primaryColumn']"  # wait for page to finish loading 
    ))
    # capture background requests and extract ones that request Tweet data
    _xhr_calls = result.scrape_result["browser_data"]["xhr_call"]
    tweet_call = [f for f in _xhr_calls if "UserBy" in f["url"]]
    for xhr in tweet_call:
        if not xhr["response"]:
            continue
        data = json.loads(xhr["response"]["body"])
        return data['data']['user']['result']


def neural_network_prediction(input_data):
    # Assume input_data is a list of 10 numbers
    input_tensor = torch.tensor(input_data, dtype=torch.float32)

    # Create an instance of the neural network
    model = SimpleNN()

    # Make a prediction
    with torch.no_grad():
        prediction = model(input_tensor["data"])

    return {"prediction": prediction.item()}


def custom_function(x):
    """
    This function returns 0 when x = 0 and approaches 30 as x approaches 100,
    but never actually reaches 30.
    """
    # Adjust the multiplier and divisor to control the range
    return 10 * (1 - math.exp(-x / 10))

if __name__ == '__main__':
    # Read input from Node.js (from stdin)
    input_data = json.loads(sys.stdin.read())


    
    if input_data['data'][0] == '@':
        input_data['data'] = input_data['data'][1:]
    
    
    user = asyncio.run(scrape_tweet(input_data['data']))

    joined = (user["legacy"]["created_at"]).split()
    joined = int(joined[5])
    
    media = user["legacy"]["media_count"]
    name = user["legacy"]["name"]
    followers = user["legacy"]["followers_count"]
    friends = user["legacy"]["friends_count"]
    description = user["legacy"]["description"]
    
    years = 2024 - joined
    if years == 0:
        years += 1
    
    AI_Score = 0
    
    AI_Score += int(call_openai_from_backend("Name: " + name)) * 5
    AI_Score += int(call_openai_from_backend("Bio: " + description)) * 5

    # Score is out of 100 here


    Fame = int(call_openai_from_backend("Fame: " + name))

    if media/years > 365:
        AI_Score *= 2
    if years < 3:
        AI_Score *= 2

    if friends == 0:
        friends += 1

    if not(Fame):
        
        AI_Score += followers/friends


    AI_Score = custom_function(AI_Score)
    print(json.dumps(str(AI_Score)[:6] + "%"))
    





