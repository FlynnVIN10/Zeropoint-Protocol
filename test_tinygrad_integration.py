#!/usr/bin/env python3
"""
Test script for tinygrad integration - Phase X Task 1
Verifies that tinygrad is properly installed and accessible
"""

import sys
import os
from pathlib import Path

def test_tinygrad_import():
    """Test if tinygrad can be imported"""
    try:
        # Add vendor/tinygrad to path
        tinygrad_path = Path("vendor/tinygrad")
        if not tinygrad_path.exists():
            print("❌ vendor/tinygrad directory not found")
            return False
        
        sys.path.insert(0, str(tinygrad_path))
        
        # Try to import tinygrad
        import tinygrad as tg
        print(f"✅ tinygrad imported successfully: {tg.__version__}")
        
        # Test basic functionality
        print(f"🔧 Available devices: {tg.Device.DEFAULT}")
        
        # Test Metal backend
        if os.environ.get("METAL") == "1":
            print("✅ Metal backend enabled")
        else:
            print("⚠️  Metal backend not enabled")
        
        return True
        
    except ImportError as e:
        print(f"❌ Failed to import tinygrad: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_tinygrad_runner():
    """Test if the tinygrad runner can be imported"""
    try:
        from runtime.tinygrad_runner import TinygradRunner
        print("✅ TinygradRunner imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Failed to import TinygradRunner: {e}")
        return False

def test_config_loading():
    """Test if the training config can be loaded"""
    try:
        import yaml
        config_path = Path("config/train.yaml")
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            print(f"✅ Training config loaded: {config.get('hyperparams', {}).get('model_size', 'unknown')} model")
            return True
        else:
            print("❌ Training config not found")
            return False
    except Exception as e:
        print(f"❌ Failed to load config: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing tinygrad integration...")
    print("=" * 50)
    
    tests = [
        ("tinygrad import", test_tinygrad_import),
        ("TinygradRunner import", test_tinygrad_runner),
        ("config loading", test_config_loading),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        if test_func():
            passed += 1
            print(f"✅ {test_name} passed")
        else:
            print(f"❌ {test_name} failed")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! tinygrad integration ready.")
        return True
    else:
        print("❌ Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
