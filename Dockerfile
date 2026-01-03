FROM python:3.11.4-alpine

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user and give ownership of the app directory
RUN adduser -D appuser \
    && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

EXPOSE 8000

# Run Gunicorn
CMD ["gunicorn", "--config", "gunicorn.conf.py", "app:app"]
