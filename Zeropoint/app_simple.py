from sanic import Sanic
from sanic.response import json, file
import asyncio
import os
import time
from pathlib import Path

app = Sanic("ZeropointProtocolMicroservice")

# Configuration
CACHE_DIR = "./cache"

# Create cache directory if it doesn't exist
Path(CACHE_DIR).mkdir(parents=True, exist_ok=True)

@app.route("/", methods=["GET"])
async def hello(request):
    return json({"message": "Hello from Zeropoint Protocol Microservice!"})

@app.route("/status", methods=["GET"])
async def status(request):
    return json({
        "text_model": {
            "name": "Not loaded",
            "loaded": False,
            "peers": 0
        },
        "image_model": {
            "name": "Not loaded", 
            "loaded": False,
            "device": None
        },
        "ipfs": {
            "connected": False,
            "status": "Not connected"
        }
    })

@app.route("/generate/text", methods=["POST"])
async def generate_text(request):
    try:
        data = request.json
        prompt = data.get("prompt", "")
        max_length = data.get("max_length", 100)
        
        # Simple mock response for now
        response = {
            "generated_text": f"Mock response to: {prompt}",
            "prompt": prompt,
            "max_length": max_length,
            "status": "success"
        }
        
        return json(response)
    except Exception as e:
        return json({"error": str(e)}, status=500)

@app.route("/generate/image", methods=["POST"])
async def generate_image(request):
    try:
        data = request.json
        prompt = data.get("prompt", "")
        
        # Simple mock response for now
        response = {
            "image_data": "mock_image_data",
            "prompt": prompt,
            "status": "success"
        }
        
        return json(response)
    except Exception as e:
        return json({"error": str(e)}, status=500)

@app.route("/peers", methods=["GET"])
async def get_peers(request):
    return json({
        "peers": [],
        "total_peers": 0,
        "status": "No peers connected"
    })

@app.route("/health", methods=["GET"])
async def health_check(request):
    return json({
        "status": "healthy",
        "timestamp": time.time(),
        "service": "Zeropoint Protocol Microservice",
        "version": "1.0.0"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 