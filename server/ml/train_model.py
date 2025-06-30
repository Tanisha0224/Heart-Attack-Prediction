import pandas as pd
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Load data
df = pd.read_csv('heart.csv')

# Ensure o2Saturation is there
if 'o2Saturation' not in df.columns:
    df['o2Saturation'] = 98  # Add default if missing (for compatibility)

X = df.drop('output', axis=1)
y = df['output']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save model

with open('model/model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✅ Model trained and saved!")
