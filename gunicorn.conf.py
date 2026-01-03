# Gunicorn configuration file

# Server socket - Unix socket for nginx communication
bind = 'unix:/tmp/gunicorn.sock'

# Worker processes
workers = 3  # Formula: (2 × CPU) + 1 = (2 × 1) + 1 = 3 for t2.micro
worker_class = 'sync'  # Sync workers (simpler, good for blocking I/O like API calls)
timeout = 120  # 120 seconds - allows slow Twitch API responses

# Logging
accesslog = '-'  # - means stdout (Docker best practice)
errorlog = '-'   # - means stderr
loglevel = 'info'

# Process naming
proc_name = 'twitch-clips-app'