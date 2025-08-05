FROM python:3.13-slim
WORKDIR /app

# Install system dependencies for building packages
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m venv venv && . venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["venv/bin/python", "app.py"] 