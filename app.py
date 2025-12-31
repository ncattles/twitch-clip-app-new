from flask import Flask, request, render_template, redirect, url_for
from dotenv import load_dotenv
from datetime import datetime
import os
import requests
import math

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

# ============================================================================
# Helper Functions
# ============================================================================

def get_broadcaster_id(channel_name):
  """Fetch broadcaster_id from channel name. Returns None on error."""
  params = {'login': channel_name}

  broadcaster_id_url = 'https://api.twitch.tv/helix/users'
  try:
    res = requests.get(broadcaster_id_url, params=params, headers=headers)
    res.raise_for_status()
  except requests.RequestException:
    return None

  data = res.json()
  if len(data['data']) == 0:
    return None

  return data['data'][0]['id'] # 0 is the first object in the list of objs


def fetch_all_clips(broadcaster_id):
  """Fetch all clips for a broadcaster using pagination. Returns list of clips."""
  params = {'broadcaster_id': broadcaster_id}
  clips_list = []

  clips_url = 'https://api.twitch.tv/helix/clips'
  try:
    res = requests.get(clips_url, params=params, headers=headers)
    res.raise_for_status()
  except requests.RequestException:
    return []

  clips_data = res.json()
  clips_array = clips_data['data']
  clips_list.extend(clips_array)

  # Fetch remaining pages
  while clips_data['pagination'].get('cursor'):
    after = clips_data['pagination'].get('cursor')
    params = {'broadcaster_id': broadcaster_id, 'after': after}

    try:
      res = requests.get(clips_url, params=params, headers=headers)
      res.raise_for_status()
    except requests.RequestException:
      break  # Return what we have so far

    clips_data = res.json()
    clips_array = clips_data['data']
    clips_list.extend(clips_array)

  return clips_list


def enrich_clips_with_dates(clips_list):
  """Add formatted_date field to each clip. Modifies clips_list in place."""
  for clip in clips_list:
    created_at = datetime.fromisoformat(clip['created_at'].replace('Z', '+00:00'))
    clip['formatted_date'] = created_at.strftime('%B %d, %Y')


def enrich_clips_with_game_names(clips_list):
  """Add game_name field to each clip. Modifies clips_list in place."""
  # Collect unique game IDs
  unique_games = set()
  for clip in clips_list:
    if clip['game_id']:
      unique_games.add(clip['game_id'])

  if not unique_games:
    # No games to fetch
    for clip in clips_list:
      clip['game_name'] = 'Unknown Game'
    return

  # Fetch game names from API
  games_url = 'https://api.twitch.tv/helix/games'
  params = [('id', game) for game in unique_games] # list comprehension

  try:
    res = requests.get(games_url, params=params, headers=headers)
    res.raise_for_status()
    data = res.json()
    game_dict = {game['id']: game['name'] for game in data['data']}
  except requests.RequestException:
    # If fetch fails, use Unknown Game
    game_dict = {}

  # Add game names to clips
  for clip in clips_list:
    game_id = clip['game_id']
    clip['game_name'] = game_dict.get(game_id, 'Unknown Game')

''' Server-side pagination
def paginate_clips(clips_list, page_number):
  """Return clips that correspond to page number."""  
  page_number = int(page_number)
  num_of_clips_to_return = 18 # 18 clips per page
  num_of_clips = len(clips_list)
  
  num_of_pages = math.ceil(num_of_clips / num_of_clips_to_return)
  
  start_index = (page_number * num_of_clips_to_return) - num_of_clips_to_return
  end_index = start_index + num_of_clips_to_return
  
  clips_list = clips_list[start_index:end_index]
  
  return clips_list        
  '''  
  
def calculate_num_of_pages(clips_list):
  """Returns total number of pages for pagination on client-side."""
  clips_per_page = 18
  num_of_clips = len(clips_list)

  num_of_pages = math.ceil(num_of_clips / clips_per_page)

  return num_of_pages

def get_page_numbers(total_pages, max_visible=7):
  """
  Returns a list of page numbers to display with '...' for gaps.
  Example: [1, '...', 5, 6, 7, 8, 9, '...', 20]
  """
  if total_pages <= max_visible:
    # Show all pages if total is small
    return list(range(1, total_pages + 1))

  # Always show first and last page
  # Show middle range around a default middle position
  pages = []
  pages.append(1)

  # Calculate middle range
  middle = max_visible - 2  # Subtract first and last page
  start = 2
  end = total_pages - 1

  # For initial load, show pages 2-6 (or similar)
  if end - start + 1 > middle:
    pages.append('...')
    for i in range(2, 2 + middle):
      pages.append(i)
    pages.append('...')
  else:
    for i in range(start, end + 1):
      pages.append(i)

  pages.append(total_pages)

  return pages
  
# ============================================================================
# Routes
# ============================================================================

@app.route('/', methods=['GET', 'POST'])
def index():
  if request.method == 'POST':
    channel_name = request.form.get('channel_name')

    if not channel_name or channel_name.strip() == '':
      return render_template('index.html', error='Please enter a channel name')

    return redirect(url_for('show_channel_clips', channel_name=channel_name))

  return render_template('index.html')


@app.route('/<channel_name>')
def show_channel_clips(channel_name):
  # Get broadcaster ID
  broadcaster_id = get_broadcaster_id(channel_name)
  if not broadcaster_id:
    return render_template('index.html', error='Channel not found. Please check the spelling and try again.')

  # Fetch all clips
  clips_list = fetch_all_clips(broadcaster_id)
  if not clips_list:
    return render_template('index.html', error='This channel has no clips yet.')

  # Enrich clips with additional data
  enrich_clips_with_dates(clips_list)
  enrich_clips_with_game_names(clips_list)

  # Calculate number of pages for client-side rendering
  num_of_pages = calculate_num_of_pages(clips_list)
  page_numbers = get_page_numbers(num_of_pages)

  ''' # Server side pagination
    # Paginate clips
    clips_list = paginate_clips(clips_list, page_number)
  '''
  return render_template('channels.html', clips=clips_list, num_of_pages=num_of_pages, page_numbers=page_numbers)
