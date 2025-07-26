#!/usr/bin/env python3
"""
Test script for Zeropoint Protocol Microservice

This script demonstrates the capabilities of the Zeropoint Protocol microservice
by testing text generation, image generation, and IPFS operations.
"""

import requests
import json
import time
import base64
from PIL import Image
import io
import os

# Configuration
SERVICE_URL = "http://localhost:8000"
TEST_PROMPT = "The future of artificial intelligence and decentralized systems"
IMAGE_PROMPT = "A futuristic city with flying cars and glowing buildings"

def test_service_status():
    """Test the service status endpoint"""
    print("🔍 Testing service status...")
    
    try:
        response = requests.get(f"{SERVICE_URL}/status")
        if response.status_code == 200:
            status = response.json()
            print("✅ Service status:")
            print(f"   Text model: {'✅ Loaded' if status['text_model']['loaded'] else '❌ Not loaded'}")
            print(f"   Image model: {'✅ Loaded' if status['image_model']['loaded'] else '❌ Not loaded'}")
            print(f"   IPFS: {'✅ Connected' if status['ipfs']['connected'] else '❌ Not connected'}")
            return True
        else:
            print(f"❌ Status check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Status check error: {e}")
        return False

def test_text_generation():
    """Test text generation with Petals"""
    print("\n📝 Testing text generation...")
    
    try:
        data = {
            "prompt": TEST_PROMPT,
            "max_length": 150,
            "temperature": 0.8,
            "store_on_ipfs": True
        }
        
        response = requests.post(f"{SERVICE_URL}/generate/text", json=data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Text generation successful!")
            print(f"   Prompt: {result['prompt']}")
            print(f"   Generated: {result['generated_text'][:100]}...")
            if 'ipfs_hash' in result:
                print(f"   IPFS Hash: {result['ipfs_hash']}")
                print(f"   IPFS URL: {result['ipfs_gateway_url']}")
            return True
        else:
            print(f"❌ Text generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Text generation error: {e}")
        return False

def test_image_generation():
    """Test image generation with Stable Diffusion"""
    print("\n🎨 Testing image generation...")
    
    try:
        data = {
            "prompt": IMAGE_PROMPT,
            "negative_prompt": "blurry, low quality, distorted",
            "height": 512,
            "width": 512,
            "num_inference_steps": 30,
            "guidance_scale": 7.5,
            "store_on_ipfs": True
        }
        
        response = requests.post(f"{SERVICE_URL}/generate/image", json=data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Image generation successful!")
            print(f"   Prompt: {result['prompt']}")
            print(f"   Model: {result['model']}")
            print(f"   Local path: {result['local_path']}")
            
            # Save the image
            if 'image_base64' in result:
                image_data = base64.b64decode(result['image_base64'])
                image = Image.open(io.BytesIO(image_data))
                test_image_path = "test_generated_image.png"
                image.save(test_image_path)
                print(f"   Saved as: {test_image_path}")
            
            if 'ipfs_hash' in result:
                print(f"   IPFS Hash: {result['ipfs_hash']}")
                print(f"   IPFS URL: {result['ipfs_gateway_url']}")
            
            return True
        else:
            print(f"❌ Image generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Image generation error: {e}")
        return False

def test_ipfs_operations():
    """Test IPFS file operations"""
    print("\n🌐 Testing IPFS operations...")
    
    try:
        # Test file upload
        test_content = "This is a test file for Zeropoint Protocol IPFS integration."
        test_file_path = "test_file.txt"
        
        with open(test_file_path, "w") as f:
            f.write(test_content)
        
        with open(test_file_path, "rb") as f:
            files = {"file": f}
            response = requests.post(f"{SERVICE_URL}/ipfs/add", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ File upload successful!")
            print(f"   Filename: {result['filename']}")
            print(f"   IPFS Hash: {result['ipfs_hash']}")
            print(f"   IPFS URL: {result['ipfs_gateway_url']}")
            
            # Test file retrieval
            ipfs_hash = result['ipfs_hash']
            response = requests.get(f"{SERVICE_URL}/ipfs/get/{ipfs_hash}")
            
            if response.status_code == 200:
                retrieve_result = response.json()
                print("✅ File retrieval successful!")
                print(f"   Retrieved content: {retrieve_result['content'][:50]}...")
                print(f"   File size: {retrieve_result['size']} bytes")
                
                # Clean up test file
                os.remove(test_file_path)
                return True
            else:
                print(f"❌ File retrieval failed: {response.status_code}")
                return False
        else:
            print(f"❌ File upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ IPFS operations error: {e}")
        return False

def test_peers_info():
    """Test Petals peers information"""
    print("\n👥 Testing peers information...")
    
    try:
        response = requests.get(f"{SERVICE_URL}/peers")
        if response.status_code == 200:
            result = response.json()
            print("✅ Peers info retrieved!")
            print(f"   Total peers: {result['total_peers']}")
            if result['peers']:
                print(f"   Sample peer: {result['peers'][0]}")
            return True
        else:
            print(f"❌ Peers info failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Peers info error: {e}")
        return False

def test_health_check():
    """Test health check endpoint"""
    print("\n🏥 Testing health check...")
    
    try:
        response = requests.get(f"{SERVICE_URL}/health")
        if response.status_code == 200:
            result = response.json()
            print("✅ Health check successful!")
            print(f"   Status: {result['status']}")
            print(f"   Timestamp: {result['timestamp']}")
            print(f"   Services: {result['services']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def main():
    """Run a demonstration of the Zeropoint Protocol service"""
    print("=== Zeropoint Protocol Service Demo ===")
    print(f"Testing service at: {SERVICE_URL}")
    print("=" * 50)
    
    # Wait a moment for service to be ready
    print("⏳ Waiting for service to be ready...")
    time.sleep(2)
    
    # Run all tests
    tests = [
        ("Service Status", test_service_status),
        ("Health Check", test_health_check),
        ("Text Generation", test_text_generation),
        ("Image Generation", test_image_generation),
        ("IPFS Operations", test_ipfs_operations),
        ("Peers Information", test_peers_info)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if success:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The Zeropoint Protocol service is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the service configuration and try again.")
    
    print("\nYou've successfully tested the Zeropoint Protocol service!")

if __name__ == "__main__":
    main()
