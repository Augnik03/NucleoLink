# Model Comparison Tool

This tool compares performance metrics of different machine learning models: FNN, GIN, XGBoost, and GCN.

## Requirements

To run this script, you need the following Python packages:
- pandas
- matplotlib
- seaborn
- numpy
- os (standard library)

Install them using:
```
pip install pandas matplotlib seaborn numpy
```

## Usage

Simply run the script:
```
python model_comparison.py
```

## Output

The script generates two sets of visualizations:

### 1. General Model Comparisons

In the `visualizations` directory:
   - `1_training_time.png` - Comparing training time in minutes for each model
   - `2_performance_metrics.png` - Bar chart of Precision, Recall, F1-Score, and AUC-ROC for all models
   - `3_accuracy.png` - Accuracy comparison between models
   - `4_radar_chart.png` - Radar chart showing all metrics for each model
   - `5_combined_visualization.png` - All four visualizations in a single image

### 2. GIN-Specific Visualizations

In the `visualizations/gin_analysis` directory:
   - `gin_vs_others_gap.png` - Compares GIN performance to the average of other models
   - `gin_metrics_spotlight.png` - Detailed breakdown of GIN's performance metrics
   - `gin_improvement_over_best_alternative.png` - Percentage improvement of GIN over the second-best model
   - `gin_performance_vs_time_tradeoff.png` - Analysis of GIN's performance vs. training time trade-off
   - `gin_radar_spotlight.png` - Focused radar chart comparing GIN to average of other models

### 3. Console Output

   - Summary table sorted by F1-Score
   - Best performing model (by F1-Score)
   - Fastest model (by training time)
   - Percentage difference of each model from the best model

## Metrics Included

- Training Time (minutes)
- Precision
- Recall
- F1-Score
- Accuracy
- AUC-ROC

## Customization

You can modify the data dictionary in the script to update metrics or add new models.

## Directory Structure

```
project/
├── model_comparison.py
├── README.md
└── visualizations/
    ├── 1_training_time.png
    ├── 2_performance_metrics.png
    ├── 3_accuracy.png
    ├── 4_radar_chart.png
    ├── 5_combined_visualization.png
    └── gin_analysis/
        ├── gin_vs_others_gap.png
        ├── gin_metrics_spotlight.png
        ├── gin_improvement_over_best_alternative.png
        ├── gin_performance_vs_time_tradeoff.png
        └── gin_radar_spotlight.png
``` 