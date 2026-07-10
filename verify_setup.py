import os
import sys
from pathlib import Path
import subprocess

def check_python_version():
    print("Checking Python version...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"[OK] Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"[ERROR] Python 3.8+ required, found {version.major}.{version.minor}")
        return False

def check_node_version():
    print("\nChecking Node.js...")
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[OK] {result.stdout.strip()}")
            return True
        else:
            print("[ERROR] Node.js not found")
            return False
    except FileNotFoundError:
        print("[ERROR] Node.js not installed")
        return False

def check_mongodb():
    print("\nChecking MongoDB connection...")
    try:
        result = subprocess.run(['mongosh', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[OK] MongoDB client installed")
            return True
        else:
            print("[WARNING] MongoDB client not found (mongosh)")
            print("[INFO] MongoDB may still be running as a service")
            return True
    except FileNotFoundError:
        print("[WARNING] mongosh not found")
        print("[INFO] MongoDB may still be running as a service")
        return True

def check_backend_env():
    print("\nChecking backend/.env...")
    env_file = Path("backend/.env")
    if env_file.exists():
        print("[OK] backend/.env exists")
        content = env_file.read_text()
        if "MONGO_URL" in content and "DB_NAME" in content:
            print("[OK] Contains required variables")
            return True
        else:
            print("[ERROR] Missing required environment variables")
            return False
    else:
        print("[ERROR] backend/.env not found")
        print("[INFO] Run: python setup.py")
        return False

def check_frontend_env():
    print("\nChecking frontend/.env...")
    env_file = Path("frontend/.env")
    if env_file.exists():
        print("[OK] frontend/.env exists")
        content = env_file.read_text()
        if "REACT_APP_BACKEND_URL" in content:
            print("[OK] Contains required variables")
            return True
        else:
            print("[ERROR] Missing REACT_APP_BACKEND_URL")
            return False
    else:
        print("[ERROR] frontend/.env not found")
        print("[INFO] Run: python setup.py")
        return False

def check_backend_dependencies():
    print("\nChecking backend dependencies...")
    try:
        import fastapi
        print("[OK] FastAPI installed")
    except ImportError:
        print("[ERROR] FastAPI not installed")
        print("[INFO] Run: pip install -r requirements.txt")
        return False
    
    try:
        import uvicorn
        print("[OK] Uvicorn installed")
    except ImportError:
        print("[ERROR] Uvicorn not installed")
        print("[INFO] Run: pip install -r requirements.txt")
        return False
    
    return True

def check_frontend_dependencies():
    print("\nChecking frontend dependencies...")
    node_modules = Path("frontend/node_modules")
    package_json = Path("frontend/package.json")
    
    if not package_json.exists():
        print("[ERROR] frontend/package.json not found")
        return False
    
    if not node_modules.exists():
        print("[ERROR] frontend/node_modules not found")
        print("[INFO] Run: cd frontend && npm install")
        return False
    
    print("[OK] Node modules exist")
    return True

def check_server_entry():
    print("\nChecking backend/server.py entry point...")
    server_file = Path("backend/server.py")
    if not server_file.exists():
        print("[ERROR] backend/server.py not found")
        return False
    
    content = server_file.read_text()
    if "__main__" in content and "uvicorn.run" in content:
        print("[OK] Server entry point configured")
        return True
    else:
        print("[WARNING] Server entry point may be missing")
        return True

def main():
    print("=" * 50)
    print("Green AI Benchmark - Setup Verification")
    print("=" * 50)
    
    checks = [
        ("Python Version", check_python_version),
        ("Node.js", check_node_version),
        ("MongoDB", check_mongodb),
        ("Backend .env", check_backend_env),
        ("Frontend .env", check_frontend_env),
        ("Backend Dependencies", check_backend_dependencies),
        ("Frontend Dependencies", check_frontend_dependencies),
        ("Server Entry Point", check_server_entry),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"[ERROR] {name}: {str(e)}")
            results.append((name, False))
    
    print("\n" + "=" * 50)
    print("VERIFICATION SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {name}")
    
    print(f"\n{passed}/{total} checks passed")
    
    if passed == total:
        print("\n[OK] Setup is complete! Ready to run.")
        print("\nNext steps:")
        print("1. Start MongoDB (if not running)")
        print("2. Start backend: cd backend && python server.py")
        print("3. Start frontend: cd frontend && npm start")
        print("\nOr use: start_all.bat")
    else:
        print("\n[WARNING] Some checks failed. Please fix the issues above.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
