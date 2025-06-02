import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

# Create visualizations directory if it doesn't exist
visualizations_dir = 'visualizations'
if not os.path.exists(visualizations_dir):
    os.makedirs(visualizations_dir)

# Create GIN-focused directory
gin_dir = os.path.join(visualizations_dir, 'gin_analysis')
if not os.path.exists(gin_dir):
    os.makedirs(gin_dir)

# Model metrics data
data = {
    'Model': ['FNN', 'GIN', 'XGBoost', 'GCN'],
    'Training Time (min)': [18, 42, 12, 35],
    'Precision': [0.930, 0.972, 0.954, 0.960],
    'Recall': [0.918, 0.975, 0.942, 0.955],
    'F1-Score': [0.924, 0.973, 0.948, 0.957],
    'Accuracy': [0.9460, 0.9830, 0.9621, 0.9710],
    'AUC-ROC': [0.942, 0.975, 0.961, 0.965]
}

# Create DataFrame
df = pd.DataFrame(data)

# Set style for better visualization
plt.style.use('ggplot')
sns.set_palette("Set2")

# 1. Training Time Comparison
plt.figure(figsize=(10, 6))
bars = plt.bar(df['Model'], df['Training Time (min)'], color=sns.color_palette("Set2"))
plt.title('Training Time Comparison', fontsize=14)
plt.ylabel('Time (minutes)', fontsize=12)
plt.ylim(0, max(df['Training Time (min)']) * 1.2)
# Add data labels
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height + 1,
             f'{height}', ha='center', va='bottom')
plt.tight_layout()
plt.savefig(os.path.join(visualizations_dir, '1_training_time.png'), dpi=300, bbox_inches='tight')
plt.close()

# 2. Performance Metrics Comparison
plt.figure(figsize=(12, 7))
metrics = ['Precision', 'Recall', 'F1-Score', 'AUC-ROC']
x = np.arange(len(metrics))
width = 0.2

for i, model in enumerate(df['Model']):
    values = [df.loc[df['Model'] == model, metric].values[0] for metric in metrics]
    plt.bar(x + i*width, values, width, label=model)

plt.title('Performance Metrics Comparison', fontsize=14)
plt.xticks(x + width*1.5, metrics)
plt.ylim(0.9, 1.0)  # Adjusted for better visualization
plt.legend()
plt.ylabel('Score', fontsize=12)
plt.tight_layout()
plt.savefig(os.path.join(visualizations_dir, '2_performance_metrics.png'), dpi=300, bbox_inches='tight')
plt.close()

# 3. Accuracy Comparison
plt.figure(figsize=(10, 6))
bars = plt.bar(df['Model'], df['Accuracy'], color=sns.color_palette("Set2"))
plt.title('Accuracy Comparison', fontsize=14)
plt.ylabel('Accuracy', fontsize=12)
plt.ylim(0.94, 0.99)  # Adjusted for better visualization
# Add data labels
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height + 0.001,
             f'{height:.4f}', ha='center', va='bottom')
plt.tight_layout()
plt.savefig(os.path.join(visualizations_dir, '3_accuracy.png'), dpi=300, bbox_inches='tight')
plt.close()

# 4. Radar Chart for All Metrics
plt.figure(figsize=(10, 10))
ax = plt.subplot(111, polar=True)
attributes = ['Precision', 'Recall', 'F1-Score', 'Accuracy', 'AUC-ROC']
num_attrs = len(attributes)
angles = np.linspace(0, 2*np.pi, num_attrs, endpoint=False).tolist()
angles += angles[:1]  # Close the plot

# Plot for each model
for i, model in enumerate(df['Model']):
    values = df.loc[df['Model'] == model, attributes].values.flatten().tolist()
    values += values[:1]  # Close the plot
    ax.plot(angles, values, linewidth=2, label=model)
    ax.fill(angles, values, alpha=0.1)

ax.set_xticks(angles[:-1])
ax.set_xticklabels(attributes)
plt.title('Model Comparison Radar Chart', fontsize=14)
plt.legend(loc='upper right')
plt.tight_layout()
plt.savefig(os.path.join(visualizations_dir, '4_radar_chart.png'), dpi=300, bbox_inches='tight')
plt.close()

# 5. Combined visualization (all 4 plots in one figure)
plt.figure(figsize=(16, 12))

# Training Time
plt.subplot(2, 2, 1)
bars = plt.bar(df['Model'], df['Training Time (min)'], color=sns.color_palette("Set2"))
plt.title('Training Time Comparison', fontsize=14)
plt.ylabel('Time (minutes)', fontsize=12)
plt.ylim(0, max(df['Training Time (min)']) * 1.2)
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height + 1,
             f'{height}', ha='center', va='bottom')

# Performance Metrics
plt.subplot(2, 2, 2)
for i, model in enumerate(df['Model']):
    values = [df.loc[df['Model'] == model, metric].values[0] for metric in metrics]
    plt.bar(x + i*width, values, width, label=model)
plt.title('Performance Metrics Comparison', fontsize=14)
plt.xticks(x + width*1.5, metrics)
plt.ylim(0.9, 1.0)
plt.legend()
plt.ylabel('Score', fontsize=12)

# Accuracy
plt.subplot(2, 2, 3)
bars = plt.bar(df['Model'], df['Accuracy'], color=sns.color_palette("Set2"))
plt.title('Accuracy Comparison', fontsize=14)
plt.ylabel('Accuracy', fontsize=12)
plt.ylim(0.94, 0.99)
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height + 0.001,
             f'{height:.4f}', ha='center', va='bottom')

# Radar Chart
ax = plt.subplot(2, 2, 4, polar=True)
for i, model in enumerate(df['Model']):
    values = df.loc[df['Model'] == model, attributes].values.flatten().tolist()
    values += values[:1]
    ax.plot(angles, values, linewidth=2, label=model)
    ax.fill(angles, values, alpha=0.1)
ax.set_xticks(angles[:-1])
ax.set_xticklabels(attributes)
plt.title('Model Comparison Radar Chart', fontsize=14)
plt.legend(loc='upper right')

plt.tight_layout()
plt.savefig(os.path.join(visualizations_dir, '5_combined_visualization.png'), dpi=300, bbox_inches='tight')
plt.close()

#----------------- GIN SPECIFIC VISUALIZATIONS -----------------#

# 1. GIN vs Others - Performance Gap (Bar Chart)
plt.figure(figsize=(12, 8))

# Extract GIN data and other models' average
gin_data = df[df['Model'] == 'GIN'].iloc[0]
other_models = df[df['Model'] != 'GIN']

# Calculate the mean of each numeric column separately
other_avg = {
    'Precision': other_models['Precision'].mean(),
    'Recall': other_models['Recall'].mean(),
    'F1-Score': other_models['F1-Score'].mean(),
    'Accuracy': other_models['Accuracy'].mean(),
    'AUC-ROC': other_models['AUC-ROC'].mean(),
    'Training Time (min)': other_models['Training Time (min)'].mean()
}

metrics = ['Precision', 'Recall', 'F1-Score', 'Accuracy', 'AUC-ROC']
x = np.arange(len(metrics))
width = 0.35

# Plot GIN vs Average of others
plt.bar(x - width/2, [gin_data[m] for m in metrics], width, label='GIN', color='#FC8D62')
plt.bar(x + width/2, [other_avg[m] for m in metrics], width, label='Average of Others', color='#66C2A5')

plt.title('GIN Performance vs. Average of Other Models', fontsize=16)
plt.ylabel('Score', fontsize=14)
plt.xticks(x, metrics, fontsize=12)
plt.ylim(0.9, 1.0)
plt.legend(fontsize=12)

# Add performance gap annotations
for i, metric in enumerate(metrics):
    gap = gin_data[metric] - other_avg[metric]
    plt.annotate(f'+{gap:.4f}', 
                xy=(i, gin_data[metric] + 0.005),
                ha='center', va='bottom',
                fontsize=10, fontweight='bold', color='#d45500')

plt.tight_layout()
plt.savefig(os.path.join(gin_dir, 'gin_vs_others_gap.png'), dpi=300, bbox_inches='tight')
plt.close()

# 2. GIN Metrics Spotlight (Horizontal Bar Chart)
plt.figure(figsize=(10, 7))

# Sorting metrics from highest to lowest
gin_metrics = gin_data[metrics].sort_values(ascending=True)
colors = plt.cm.Oranges(np.linspace(0.5, 0.8, len(metrics)))

bars = plt.barh(gin_metrics.index, gin_metrics.values, color=colors)
plt.title('GIN Model - Performance Metrics Breakdown', fontsize=16)
plt.xlabel('Score', fontsize=14)
plt.xlim(0.96, 0.98)  # Adjusted to focus on the high scores

# Add data labels
for bar in bars:
    width = bar.get_width()
    plt.text(width + 0.0005, bar.get_y() + bar.get_height()/2, 
             f'{width:.4f}', va='center', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.savefig(os.path.join(gin_dir, 'gin_metrics_spotlight.png'), dpi=300, bbox_inches='tight')
plt.close()

# 3. GIN Improvement Over Best Alternative (GCN) (Horizontal Bar Chart)
plt.figure(figsize=(12, 6))

# Find the second best model (in terms of F1-Score)
second_best = df[df['Model'] != 'GIN'].sort_values(by='F1-Score', ascending=False).iloc[0]
improvement = {}

for metric in metrics:
    improvement[metric] = ((gin_data[metric] - second_best[metric]) / second_best[metric]) * 100

# Sort improvement from largest to smallest
improvement_sorted = {k: v for k, v in sorted(improvement.items(), key=lambda item: item[1], reverse=True)}

plt.barh(list(improvement_sorted.keys()), list(improvement_sorted.values()), color=plt.cm.Oranges(np.linspace(0.5, 0.8, len(metrics))))
plt.title(f'GIN Improvement Over {second_best["Model"]} (%)', fontsize=16)
plt.xlabel('Improvement (%)', fontsize=14)
plt.grid(axis='x', linestyle='--', alpha=0.7)

# Add data labels
for i, v in enumerate(improvement_sorted.values()):
    plt.text(v + 0.05, i, f'+{v:.2f}%', va='center', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.savefig(os.path.join(gin_dir, 'gin_improvement_over_best_alternative.png'), dpi=300, bbox_inches='tight')
plt.close()

# 4. Trade-off: GIN Performance vs. Training Time
fig, ax1 = plt.figure(figsize=(10, 6)), plt.gca()

# Training time on primary y-axis
ax1.set_xlabel('Model', fontsize=14)
ax1.set_ylabel('Training Time (minutes)', fontsize=14, color='#2c7fb8')
ax1.bar(df['Model'], df['Training Time (min)'], alpha=0.6, color='#2c7fb8')
ax1.tick_params(axis='y', labelcolor='#2c7fb8')

# Performance metrics on secondary y-axis
ax2 = ax1.twinx()
ax2.set_ylabel('Performance Score', fontsize=14, color='#d95f02')
line1 = ax2.plot(df['Model'], df['F1-Score'], 'o-', linewidth=3, color='#d95f02', label='F1-Score')
line2 = ax2.plot(df['Model'], df['Accuracy'], 's-', linewidth=3, color='#e7298a', label='Accuracy')
ax2.tick_params(axis='y', labelcolor='#d95f02')
ax2.set_ylim(0.9, 1.0)

# Highlighting GIN specifically
gin_idx = df.index[df['Model'] == 'GIN'].tolist()[0]
ax1.get_children()[gin_idx].set_color('#ca0020')
ax1.get_children()[gin_idx].set_alpha(0.9)

# Annotation for GIN
plt.annotate('GIN: High Performance\nLong Training', 
            xy=(gin_idx, df.loc[gin_idx, 'Training Time (min)']),
            xytext=(gin_idx-0.1, df.loc[gin_idx, 'Training Time (min)']+10),
            arrowprops=dict(facecolor='black', shrink=0.05, width=1.5),
            fontsize=10, fontweight='bold')

# Legend for lines
lines = line1 + line2
labels = [l.get_label() for l in lines]
ax2.legend(lines, labels, loc='upper right')

plt.title('Trade-off: Model Performance vs. Training Time', fontsize=16)
plt.tight_layout()
plt.savefig(os.path.join(gin_dir, 'gin_performance_vs_time_tradeoff.png'), dpi=300, bbox_inches='tight')
plt.close()

# 5. GIN vs Others - Radar Chart Spotlight 
plt.figure(figsize=(10, 10))
ax = plt.subplot(111, polar=True)

# Colors for the models
colors = {'GIN': '#fc8d62', 'Others': '#66c2a5'}

# Get GIN data and average of others for specific metrics
gin_values = df.loc[df['Model'] == 'GIN', attributes].values.flatten().tolist()
gin_values += gin_values[:1]  # Close the plot

# Calculate mean for each attribute separately
others_avg = [other_avg[attr] for attr in attributes]
others_avg += others_avg[:1]  # Close the plot

# Plot radar charts
ax.plot(angles, gin_values, linewidth=3, label='GIN', color=colors['GIN'])
ax.fill(angles, gin_values, alpha=0.2, color=colors['GIN'])

ax.plot(angles, others_avg, linewidth=3, label='Avg of Others', color=colors['Others'], linestyle='--')
ax.fill(angles, others_avg, alpha=0.2, color=colors['Others'])

ax.set_xticks(angles[:-1])
ax.set_xticklabels(attributes, fontsize=12)

# Add score labels for GIN
for i, metric in enumerate(attributes):
    plt.annotate(f"{gin_values[i]:.3f}",
                xy=(angles[i], gin_values[i]),
                xytext=(angles[i], gin_values[i]+0.02),
                ha='center', fontsize=11, fontweight='bold', color=colors['GIN'])

plt.title('GIN vs. Average of Other Models', fontsize=16, pad=20)
plt.legend(loc='upper right', fontsize=12)

# Add grid
ax.grid(True, linestyle='-', alpha=0.7)

plt.tight_layout()
plt.savefig(os.path.join(gin_dir, 'gin_radar_spotlight.png'), dpi=300, bbox_inches='tight')
plt.close()

# Create a summary table and sort by F1-Score (descending)
best_model = df.loc[df['F1-Score'].idxmax(), 'Model']
fastest_model = df.loc[df['Training Time (min)'].idxmin(), 'Model']

print("\nModel Performance Summary (Sorted by F1-Score):")
print(df.sort_values(by='F1-Score', ascending=False).to_string(index=False))
print(f"\nBest performing model (by F1-Score): {best_model}")
print(f"Fastest model (by Training Time): {fastest_model}")

# Calculate percentage difference from best model
best_metrics = df.loc[df['F1-Score'].idxmax()].copy()
df_relative = pd.DataFrame()
df_relative['Model'] = df['Model']

for metric in ['Precision', 'Recall', 'F1-Score', 'Accuracy', 'AUC-ROC']:
    best_value = best_metrics[metric]
    df_relative[f'{metric} (% diff from best)'] = ((df[metric] - best_value) / best_value * 100).round(2)

print("\nPercentage Difference from Best Model (GIN):")
print(df_relative.to_string(index=False))

print(f"\nVisualizations saved to '{visualizations_dir}' directory:"
      f"\n- 1_training_time.png"
      f"\n- 2_performance_metrics.png"
      f"\n- 3_accuracy.png"
      f"\n- 4_radar_chart.png"
      f"\n- 5_combined_visualization.png")

print(f"\nGIN-specific visualizations saved to '{gin_dir}' directory:"
      f"\n- gin_vs_others_gap.png"
      f"\n- gin_metrics_spotlight.png"
      f"\n- gin_improvement_over_best_alternative.png" 
      f"\n- gin_performance_vs_time_tradeoff.png"
      f"\n- gin_radar_spotlight.png") 