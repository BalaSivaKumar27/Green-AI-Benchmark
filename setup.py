#!/usr/bin/env python3
"""
Setup script for Green AI Benchmark
Creates necessary configuration files and provides setup instructions
"""
import os
from pathlib import Path

def create_backend_env():
    """Create backend .env file"""
    backend_env = Path("backend/.env")
    backend_env.parent.mkdir(exist_ok=True)
    
    content = """# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=green_ai_benchmark

# CORS Origins (comma-separated, use * for all origins)
CORS_ORIGINS=http://localhost:3000
"""
    
    with open(backend_env, 'w') as f:
        f.write(content)
    print("[OK] Created backend/.env")

def create_frontend_env():
    """Create frontend .env file"""
    frontend_env = Path("frontend/.env")
    frontend_env.parent.mkdir(exist_ok=True)
    
    content = """REACT_APP_BACKEND_URL=http://localhost:8000
"""
    
    with open(frontend_env, 'w') as f:
        f.write(content)
    print("[OK] Created frontend/.env")

def main():
    print("Setting up Green AI Benchmark...\n")
    
    # Create .env files
    create_backend_env()
    create_frontend_env()
    
    print("\n[OK] Setup complete!")
    print("\nNext steps:")
    print("1. Install MongoDB (if not already installed)")
    print("2. Install Python dependencies: cd backend && pip install -r requirements.txt")
    print("3. Install Node dependencies: cd frontend && npm install")
    print("4. Start MongoDB server")
    print("5. Start backend: cd backend && python server.py")
    print("6. Start frontend: cd frontend && npm start")

if __name__ == "__main__":
    main()

