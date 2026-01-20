import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
import json
import os

def train_model():
    print("Loading training data...")
    
    # Get the correct path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))
    data_path = os.path.join(project_root, 'ml', 'data', 'rice_statistics_rice_type_based.csv')
    
    # Read CSV with encoding handling
    try:
        df = pd.read_csv(data_path, encoding='utf-8')
    except UnicodeDecodeError:
        print("UTF-8 failed, trying latin-1 encoding...")
        try:
            df = pd.read_csv(data_path, encoding='latin-1')
        except:
            print("latin-1 failed, trying cp1252 encoding...")
            df = pd.read_csv(data_path, encoding='cp1252')
    
    print(f"Loaded {len(df)} records")
    print(f"Columns: {df.columns.tolist()}")
    
    # Remove any rows with missing values
    df = df.dropna()
    print(f"After removing NaN: {len(df)} records")
    
    # Encode categorical variables
    le_district = LabelEncoder()
    le_rice_type = LabelEncoder()
    le_season = LabelEncoder()
    
    df['district_encoded'] = le_district.fit_transform(df['district'])
    df['rice_type_encoded'] = le_rice_type.fit_transform(df['rice_type_name'])
    df['season_encoded'] = le_season.fit_transform(df['season_name'])
    
    # Features and target
    X = df[['district_encoded', 'rice_type_encoded', 'season_encoded']]
    y = df['quantity_kg']
    
    print(f"\nFeature shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print("\nTraining model...")
    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Calculate accuracy
    score = model.score(X_test, y_test)
    print(f"Model R² Score: {score:.2f}")
    
    # Create models directory if it doesn't exist
    models_dir = os.path.join(project_root, 'ml', 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(models_dir, 'production_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved to: {model_path}")
    
    # Save encoders
    encoders = {
        'districts': le_district.classes_.tolist(),
        'rice_types': le_rice_type.classes_.tolist(),
        'seasons': le_season.classes_.tolist()
    }
    
    encoders_path = os.path.join(models_dir, 'encoders.json')
    with open(encoders_path, 'w', encoding='utf-8') as f:
        json.dump(encoders, f, indent=2, ensure_ascii=False)
    print(f"Encoders saved to: {encoders_path}")
    
    print("\n✅ Model training completed successfully!")
    print(f"\nUnique districts: {encoders['districts']}")
    print(f"Unique rice types: {encoders['rice_types']}")
    print(f"Unique seasons: {encoders['seasons']}")

if __name__ == '__main__':
    train_model()