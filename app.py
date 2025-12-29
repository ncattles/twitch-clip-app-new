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

access_token_res = requests.post(access_token_url, data = access_token_obj)
access_token = access_token_res.json()
access_token = access_token['access_token']

# re-usable header for API calls
headers = {'Authorization': f'Bearer {access_token}', 'Client-Id': app.config['TWITCH_CLIENT_ID']}

# homepage
@app.route('/', methods = ['GET', 'POST'])
def login():
  if request.method == 'POST':
    
    # get channel name from template and construct obj to pass
    channel_name = request.form.get('channel_name')
    params = {'login': channel_name}
    
    # get broadcaster_id from channel name
    broadcaster_id_url = 'https://api.twitch.tv/helix/users'
    res = requests.get(broadcaster_id_url, params=params, headers=headers) 
    data = res.json()
    broadcaster_id = data['data'][0]['id'] # 0 points to the first json object in the list of dicts (this only returned one, but could return multiple based on the params (such as more than one login username passed))
    
    
    # get clips for a channel
    
    
  else:
    print('user logs into twitch')
  
  return render_template('index.html')

