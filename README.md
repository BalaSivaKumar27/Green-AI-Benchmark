# Green AI Benchmark

A full-stack web application for benchmarking machine learning models on energy efficiency, carbon footprint, and accuracy. It computes a unified **Green Score** to help you choose models that balance performance with environmental impact.

---

## Overview

Green AI Benchmark lets you run classification models against built-in or custom datasets, then measures energy consumption and training time in real time. Results are visualised in interactive charts and ranked by Green Score so you can make eco-informed model choices.

**Green Score formula:**

```
GreenScore = Accuracy / (Energy_kWh + 0.1 × Train_Time_s) × 100
```

Higher is better — it rewards high accuracy with low energy and fast training.

---

## Features

- Run 24+ scikit-learn classifiers plus LightGBM and XGBoost against any dataset
- Real-time CPU-based energy and carbon footprint estimation
- Upload custom CSV datasets with a configurable target column
- 100+ built-in datasets (Iris, MNIST, Wine Quality, Breast Cancer, and synthetic variants)
- Interactive scatter plot (Accuracy vs Energy) and bar chart (Top 10 by Green Score)
- Confusion matrix heatmap per benchmark run
- Eco-efficiency recommendations ranked by Green Score
- Export results to CSV
- Download benchmark reports as HTML or PDF
- Results persisted to MongoDB (optional — app works without it)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS, shadcn/ui, Recharts, Framer Motion |
| Backend | FastAPI, Python 3.8+, scikit-learn, pandas, numpy |
| Database | MongoDB (via Motor — optional) |
| Build | CRACO, PostCSS |
| Reports | ReportLab (PDF), HTML |

---

## Project Structure

```
Green-AI-Benchmark/
├── backend/
│   ├── server.py          # FastAPI app, ML pipeline, API routes
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Overview and stats
│   │   │   ├── Analyze.jsx          # Run benchmarks, charts, results table
│   │   │   └── Recommendations.jsx  # Top models by Green Score
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── GreenScoreCard.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── hooks/
│   │   └── lib/
│   ├── package.json
│   └── craco.config.js
├── setup.py               # Creates .env files
├── verify_setup.py        # Pre-flight checks
├── start_all.bat          # Starts both servers on Windows
└── tests/
```

---

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- MongoDB (optional — results are stored in-memory if unavailable)

---

## Setup

**1. Clone the repository**

```bash
git clone <repository-url>
cd Green-AI-Benchmark
```

**2. Run the setup script** to generate `.env` files for both backend and frontend:

```bash
python setup.py
```

This creates:
- `backend/.env` with `MONGO_URL`, `DB_NAME`, and `CORS_ORIGINS`
- `frontend/.env` with `REACT_APP_BACKEND_URL`

**3. Install backend dependencies**

```bash
cd backend
pip install -r requirements.txt
```

**4. Install frontend dependencies**

```bash
cd frontend
npm install --legacy-peer-deps
```

---

## Running the Application

### Windows (recommended)

```bash
start_all.bat
```

This starts both servers in separate terminal windows.

### Manual start

**Backend** (from the `backend/` directory):

```bash
python server.py
```

**Frontend** (from the `frontend/` directory):

```bash
npm start
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URL` | `mongodb://localhost:27017` | MongoDB connection string |
| `DB_NAME` | `green_ai_benchmark` | Database name |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |

### Frontend — `frontend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_BACKEND_URL` | `http://localhost:8000` | Backend base URL |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/datasets/list` | List all available datasets |
| `POST` | `/api/datasets/upload` | Upload a custom CSV dataset |
| `GET` | `/api/models/list` | List all available models |
| `POST` | `/api/models/run` | Run a benchmark |
| `GET` | `/api/results` | Get all benchmark results |
| `DELETE` | `/api/results` | Clear all results |
| `GET` | `/api/results/recommendations` | Get top 5 models by Green Score |
| `GET` | `/api/report` | Download HTML report |
| `GET` | `/api/report.pdf` | Download PDF report |

### Run a benchmark

```bash
curl -X POST http://localhost:8000/api/models/run \
  -H "Content-Type: application/json" \
  -d '{"model": "Random Forest", "dataset": "Iris"}'
```

### Upload a custom dataset

```bash
curl -X POST "http://localhost:8000/api/datasets/upload?target_column=label" \
  -F "file=@my_dataset.csv"
```

---

## Supported Models

| Model | Key |
|-------|-----|
| Random Forest | `RandomForest` |
| Logistic Regression | `LogisticRegression` |
| Gradient Boosting | `GradientBoosting` |
| Multi-Layer Perceptron | `MLP` |
| Support Vector Machine | `SVM` |
| K-Nearest Neighbors | `KNN` |
| Decision Tree | `DecisionTree` |
| AdaBoost | `AdaBoost` |
| Extra Trees | `ExtraTrees` |
| LightGBM | `LightGBM` |
| XGBoost | `XGBoost` |
| Naive Bayes (Gaussian, Multinomial, Bernoulli, Complement) | `GaussianNB` etc. |
| LDA / QDA | `LDA`, `QDA` |
| Ridge, Perceptron, Passive Aggressive | `Ridge` etc. |
| Gaussian Process | `GaussianProcess` |

---

## Built-in Datasets

| Dataset | Samples | Features | Task |
|---------|---------|----------|------|
| Iris | 150 | 4 | Multi-class classification |
| Wine Quality | 1,599 | 11 | Multi-class classification |
| Breast Cancer | 569 | 30 | Binary classification |
| Diabetes | 768 | 8 | Binary classification |
| Heart Disease | 303 | 13 | Binary classification |
| Energy Efficiency | 768 | 8 | Multi-class classification |
| MNIST (digits) | 70,000 | 784 | Multi-class classification |
| Synthetic (Binary, Multi-Class, Imbalanced, High-Dimensional) | Varies | Varies | Classification |

100+ synthetic datasets are auto-generated at startup.

---

## Verify Your Setup

Run the pre-flight check script to confirm all dependencies and configuration are in place:

```bash
python verify_setup.py
```

It checks Python version, Node.js, MongoDB, `.env` files, installed packages, and the server entry point.

---

## MongoDB Notes

MongoDB is **optional**. If `MONGO_URL` is not set or the connection fails:
- Benchmark results are not persisted between restarts
- The `/api/results` endpoint returns an empty list
- The app remains fully functional for running and viewing benchmarks in the current session

---

## License

This project is open source. See `LICENSE` for details.
