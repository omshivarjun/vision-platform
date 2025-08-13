"""
Basic test to verify AI service structure
"""

import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def test_imports():
    """Test that all modules can be imported"""
    try:
        from app.core.config import settings
        print("✅ Config imported successfully")
        
        from app.core.database import init_db, close_db
        print("✅ Database imported successfully")
        
        from app.core.middleware import RequestLoggingMiddleware
        print("✅ Middleware imported successfully")
        
        from app.api.v1.api import api_router
        print("✅ API router imported successfully")
        
        from app.api.v1.health import router as health_router
        print("✅ Health router imported successfully")
        
        from app.api.v1.translation import router as translation_router
        print("✅ Translation router imported successfully")
        
        from app.api.v1.ocr import router as ocr_router
        print("✅ OCR router imported successfully")
        
        from app.api.v1.speech import router as speech_router
        print("✅ Speech router imported successfully")
        
        from app.api.v1.accessibility import router as accessibility_router
        print("✅ Accessibility router imported successfully")
        
        print("\n🎉 All imports successful! AI service structure is correct.")
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_config():
    """Test configuration loading"""
    try:
        from app.core.config import settings
        
        # Test basic settings
        assert settings.APP_NAME == "Vision Platform AI Service"
        assert settings.APP_VERSION == "1.0.0"
        assert settings.PORT == 8000
        
        print("✅ Configuration loaded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing AI Service Structure...\n")
    
    import_success = test_imports()
    config_success = test_config()
    
    if import_success and config_success:
        print("\n✅ All tests passed! AI service is ready.")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Please check the structure.")
        sys.exit(1)
