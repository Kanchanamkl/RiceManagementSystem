import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import pickle
import json
import os
import sys

def train_model():
    try:
        # Create models directory if it doesn't exist
        os.makedirs('ml/models', exist_ok=True)
        
        # Load training data
        print("Loading training data...")
        data_path = 'ml/data/rice_statistics_rice_type_based.csv'
        
        if not os.path.exists(data_path):
            print(f"Error: Training data not found at {data_path}")
            print("Please run 'npm run export-data' first to create the training data.")
            sys.exit(1)
        
        df = pd.read_csv(data_path, encoding='utf-8')
        
        if df.empty:
            print("Error: Training data is empty. Please add production records first.")
            sys.exit(1)
        
        print(f"Dataset shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        print(f"\nUnique values:")
        print(f"  Districts: {df['district'].nunique()}")
        print(f"  Rice Types: {df['rice_type_name'].nunique()}")
        print(f"  Seasons: {df['season_name'].nunique()}")
        
        # Initialize encoders
        encoders = {
            'district': LabelEncoder(),
            'rice_type_name': LabelEncoder(),
            'season_name': LabelEncoder()
        }
        
        # Encode categorical variables
        print("\nEncoding categorical variables...")
        df['district_encoded'] = encoders['district'].fit_transform(df['district'])
        df['rice_type_encoded'] = encoders['rice_type_name'].fit_transform(df['rice_type_name'])
        df['season_encoded'] = encoders['season_name'].fit_transform(df['season_name'])
        
        # Prepare features and target
        X = df[['district_encoded', 'rice_type_encoded', 'season_encoded']].astype(np.float64)
        y = df['quantity_kg'].astype(np.float64)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        print("\nTraining Random Forest model...")
        model = RandomForestRegressor(
            n_estimators=150,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        
        # Evaluate model
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        
        print(f"\nModel Performance:")
        print(f"Training R² Score: {train_score:.4f}")
        print(f"Testing R² Score: {test_score:.4f}")
        print(f"Mean Absolute Error: {mae:.2f} kg")
        
        # Save model with protocol 4 for compatibility
        model_path = 'ml/models/production_model.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(model, f, protocol=4)
        print(f"\nModel saved to {model_path}")
        
        # Save encoders mapping
        encoders_mapping = {
            'district': {str(label): int(idx) for idx, label in enumerate(encoders['district'].classes_)},
            'rice_type_name': {str(label): int(idx) for idx, label in enumerate(encoders['rice_type_name'].classes_)},
            'season_name': {str(label): int(idx) for idx, label in enumerate(encoders['season_name'].classes_)}
        }
        
        encoders_path = 'ml/models/encoders.json'
        with open(encoders_path, 'w', encoding='utf-8') as f:
            json.dump(encoders_mapping, f, indent=2, ensure_ascii=False)
        print(f"Encoders saved to {encoders_path}")
        
        # Save statistics
        stats = {
            'training_samples': int(len(df)),
            'districts': sorted(df['district'].unique().tolist()),
            'rice_types': sorted(df['rice_type_name'].unique().tolist()),
            'seasons': sorted(df['season_name'].unique().tolist()),
            'quantity_stats': {
                'mean': float(df['quantity_kg'].mean()),
                'std': float(df['quantity_kg'].std()),
                'min': float(df['quantity_kg'].min()),
                'max': float(df['quantity_kg'].max())
            }
        }
        
        stats_path = 'ml/models/training_stats.json'
        with open(stats_path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
        print(f"Training statistics saved to {stats_path}")
        
        # Feature importances
        feature_importance = {
            'district': float(model.feature_importances_[0]),
            'rice_type': float(model.feature_importances_[1]),
            'season': float(model.feature_importances_[2])
        }
        print(f"\nFeature Importances:")
        for feature, importance in feature_importance.items():
            print(f"  {feature}: {importance:.4f}")
        
        print("\n✅ Model training completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during training: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    train_model()