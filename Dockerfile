FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and image operations
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, models, and data
COPY backend/ ./backend/
COPY models/ ./models/
COPY data/ ./data/

# Ensure directory structure
RUN mkdir -p uploads

ENV PORT=5001
ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

EXPOSE 5001

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5001} backend.app:app --timeout 180 --workers 1 --threads 4"]
