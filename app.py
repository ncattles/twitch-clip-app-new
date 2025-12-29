from flask import Flask, request, render_template

app = Flask(__name__)

@app.route('/', methods = ['GET', 'POST'])
def login():
  if request.method == 'POST':
    channel_name = request.form.get("channel_name")
    print(f"the channel name you inputted was {channel_name}")
  else:
    print("user logs into twitch")
  
  return render_template('index.html')

