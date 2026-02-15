Install dependencies

Backend:
    1. pip install -r requirements.txt

Frontend:
    1. cd frontend
    2. npm install --legacy-peer-deps

Start backend (Terminal 1)
    1. cd backend
    2. python server.py

Start frontend (Terminal 2)
    1. cd frontend
    2. npm start

How to kill the port which was running already : 

    2. netstat -ano | findstr :3000
    3. taskkill /PID 0 /F


URLs
    1. Frontend: http://localhost:3000
    2. Backend API: http://localhost:8000
    3. API Docs: http://localhost:8000/docs

Troubleshooting

backend/.env not found

Run from repo root:
    1. python setup.py

Frontend dependencies not installed
    1. cd frontend
    2. npm install --legacy-peer-deps

Frontend won’t start / weird errors
    1. cd frontend
    2. Remove-Item -Recurse -Force node_modules, package-lock.json
    3. npm install --legacy-peer-deps
    4. npm start

MongoDB not running
    1. Open Services (services.msc) → start “MongoDB Server (MongoDB)”


in your Cmd terminal run the following commands 
    1. pip install kaggle
    2. kaggle datasets list
