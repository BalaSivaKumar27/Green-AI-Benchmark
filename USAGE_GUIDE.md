# Green AI Benchmark - Usage Guide

## Overview
The Green AI Benchmark is a full-stack web application that evaluates machine learning models based on their eco-efficiency using the **Green Score** metric.

**Green Score Formula:**
```
Green Score = Accuracy / (Energy + 0.1 × Time)
```

## Features

### 1. Dynamic Model Selection
- **Pre-loaded Models:** RandomForest, LogisticRegression, GradientBoosting, MLP, SVM, KNN, DecisionTree
- **Custom Models:** Click the "+" button to enter any model name (e.g., "XGBoost", "LightGBM", etc.)

### 2. Dataset Management

#### Pre-loaded Datasets:
- **Iris** - Flower classification (150 samples, 4 features)
- **MNIST** - Handwritten digits (70k samples, 784 features)  
- **Wine Quality** - Wine classification (1599 samples, 11 features)
- **Energy Efficiency** - Building efficiency (768 samples, 8 features)

#### Custom Dataset Upload:
1. Prepare a CSV file with your data
2. Ensure it has a target column (e.g., "target", "label", "class")
3. Click "Upload Custom Dataset" section
4. Select your CSV file
5. Enter the target column name
6. Click "Upload Dataset"

**CSV Format Example:**
```csv
feature1,feature2,feature3,target
1.2,3.4,5.6,0
2.3,4.5,6.7,1
3.4,5.6,7.8,0
```

### 3. Running Benchmarks

#### Steps:
1. Select a **Model** (or enter custom model name)
2. Select a **Dataset** (pre-loaded or uploaded)
3. Click **"Run Benchmark"**
4. Wait for the results (real ML training happens!)

#### What Gets Measured:
- **Accuracy** - Model performance on test data
- **Energy (kWh)** - Estimated energy consumption during training
- **Carbon (kg CO₂e)** - Carbon footprint (energy × 0.5 kg/kWh)
- **Training Time (s)** - Time to train the model
- **Inference Time (s)** - Time to make predictions
- **Green Score** - Unified eco-efficiency metric

### 4. Visualizations

#### Scatter Plot: Accuracy vs Energy
- Shows the tradeoff between model accuracy and energy consumption
- Ideal models are in the top-left (high accuracy, low energy)

#### Bar Chart: Top 10 Models by Green Score
- Ranks models by their eco-efficiency
- Higher scores = better balance of accuracy and energy

#### Results Table
- Complete data for all benchmark runs
- Export to CSV for further analysis

### 5. Recommendations Page
- View top 5 models ranked by Green Score
- See detailed metrics and reasoning
- Understand why certain models are more eco-efficient

## API Endpoints

### Models
- `GET /api/models/list` - List available models
- `POST /api/models/run` - Run benchmark
  ```json
  {
    "model": "RandomForest",
    "dataset": "Iris"
  }
  ```

### Datasets
- `GET /api/datasets/list` - List all datasets
- `POST /api/datasets/upload` - Upload custom dataset
  - Form data with `file` and `target_column`

### Results
- `GET /api/results` - Get all benchmark results
- `GET /api/results/recommendations` - Get top recommendations
- `DELETE /api/results` - Clear all results

## Examples

### Example 1: Test Multiple Models on Same Dataset
```bash
# Test different models on Iris dataset
curl -X POST "$BACKEND_URL/api/models/run" \
  -H "Content-Type: application/json" \
  -d '{"model":"RandomForest","dataset":"Iris"}'

curl -X POST "$BACKEND_URL/api/models/run" \
  -H "Content-Type: application/json" \
  -d '{"model":"LogisticRegression","dataset":"Iris"}'

curl -X POST "$BACKEND_URL/api/models/run" \
  -H "Content-Type: application/json" \
  -d '{"model":"SVM","dataset":"Iris"}'
```

### Example 2: Upload Custom Dataset
```bash
# Create sample dataset
cat > my_data.csv << EOF
age,income,score,purchased
25,50000,75,1
35,75000,85,1
45,100000,65,0
EOF

# Upload it
curl -X POST "$BACKEND_URL/api/datasets/upload?target_column=purchased" \
  -F "file=@my_data.csv"
```

### Example 3: Test Custom Model Name
```bash
curl -X POST "$BACKEND_URL/api/models/run" \
  -H "Content-Type: application/json" \
  -d '{"model":"MyCustomModel","dataset":"Iris"}'
```

## Understanding Green Score

### What Makes a Good Green Score?
- **> 1000:** Excellent - High accuracy with minimal energy
- **100-1000:** Good - Balanced performance
- **10-100:** Fair - Moderate efficiency
- **< 10:** Poor - High energy cost relative to accuracy

### Example Comparison:
| Model | Accuracy | Energy (kWh) | Time (s) | Green Score |
|-------|----------|--------------|----------|-------------|
| LogisticRegression | 100% | 0.000009 | 0.39 | 2564.96 |
| SVM | 75.93% | 0.000000 | 0.10 | 7353.42 |
| GradientBoosting | 74.17% | 0.000006 | 0.93 | 3003.0 |

### Key Insights:
1. **SVM** has the highest Green Score despite lower accuracy because of extremely low energy consumption
2. **LogisticRegression** achieves perfect accuracy with minimal resources
3. **GradientBoosting** balances high accuracy with reasonable energy use

## Tips for Best Results

1. **Start Small:** Test with Iris dataset first (fastest)
2. **Compare Fairly:** Test multiple models on the same dataset
3. **Consider Scale:** Large datasets (MNIST) will consume more energy
4. **Upload Quality Data:** Clean, preprocessed datasets work best
5. **Export Results:** Use CSV export for detailed analysis
6. **Review Recommendations:** Check which models are most eco-efficient for your use case

## Troubleshooting

### Issue: Upload fails
- **Solution:** Ensure CSV has proper format and valid target column name

### Issue: Benchmark takes too long
- **Solution:** Start with smaller datasets or simpler models

### Issue: Low Green Score
- **Solution:** Try simpler models (LogisticRegression, KNN) or optimize your dataset

### Issue: Model not found
- **Solution:** Use custom model input or check spelling

## Technical Details

### How Energy is Measured:
- CPU usage is monitored during training
- Energy = (CPU% / 100) × Time × 0.0001 kWh/s
- This is an estimation based on typical CPU power consumption

### How Accuracy is Measured:
- 70/30 train-test split
- Standard sklearn accuracy_score metric
- Categorical features are encoded automatically

### Supported File Types:
- CSV files only for dataset upload
- Must have column headers
- Target column must contain numeric or categorical values

## Next Steps

1. Run benchmarks with different model-dataset combinations
2. Upload your own datasets
3. Compare results using visualizations
4. Export data for research or reporting
5. Use recommendations to choose eco-efficient models

---

**Need Help?** Check the API documentation or contact support.
