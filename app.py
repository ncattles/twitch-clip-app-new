from flask import Flask, request, render_template
from dotenv import load_dotenv
import os
import requests

load_dotenv()
app = Flask(__name__)

app.config['TWITCH_CLIENT_ID'] = os.environ.get('TWITCH_CLIENT_ID')
app.config['TWITCH_CLIENT_SECRET'] = os.environ.get('TWITCH_CLIENT_SECRET')

# get access token for app
access_token_url = 'https://id.twitch.tv/oauth2/token'
access_token_obj = {'client_id': app.config['TWITCH_CLIENT_ID'], 'client_secret': app.config['TWITCH_CLIENT_SECRET'], 'grant_type': 'client_credentials'}

access_token_resp = requests.post(access_token_url, data = access_token_obj)
access_token = access_token_resp.json()
access_token = access_token['access_token']

# homepage
@app.route('/', methods = ['GET', 'POST'])
def login():
  if request.method == 'POST':
    channel_name = request.form.get('channel_name')
    print(f'the channel name you inputted was {channel_name}')
  else:
    print('user logs into twitch')
  
  return render_template('index.html')

