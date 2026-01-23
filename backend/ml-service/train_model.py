import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def train_crop_model():
    print("="*50)
    print("CROP RECOMMENDATION MODEL TRAINING")
    print("="*50)
    
    data_path = 'data/Crop_recommendation.csv'
    model_path = 'models/crop_model.pkl'
    
    if not os.path.exists('models'):
        os.makedirs('models')
    
    print("\n[1] Loading dataset...")
    df = pd.read_csv(data_path)
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Crops in dataset: {df['label'].nunique()}")
    print(f"Crop distribution:\n{df['label'].value_counts()}")
    
    print("\n[2] Preparing features and labels...")
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']
    
    print("\n[3] Splitting data (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Training samples: {X_train.shape[0]}")
    print(f"Testing samples: {X_test.shape[0]}")
    
    print("\n[4] Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    print("Training completed!")
    
    print("\n[5] Evaluating model...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    
    print("\n[6] Saving trained model...")
    joblib.dump(model, model_path)
    print(f"Model saved to: {model_path}")
    
    print("\n[7] Testing prediction with sample data...")
    sample = [[90, 42, 43, 20.87, 82.00, 6.50, 202.93]]
    prediction = model.predict(sample)
    probabilities = model.predict_proba(sample)[0]
    top_3_indices = np.argsort(probabilities)[-3:][::-1]
    top_3_crops = [model.classes_[i] for i in top_3_indices]
    top_3_probs = [probabilities[i] for i in top_3_indices]
    
    print(f"Sample Input: N=90, P=42, K=43, Temp=20.87, Humidity=82, pH=6.50, Rainfall=202.93")
    print(f"Primary Recommendation: {top_3_crops[0]} (Confidence: {top_3_probs[0]*100:.2f}%)")
    print(f"Other Recommendations: {top_3_crops[1]} ({top_3_probs[1]*100:.2f}%), {top_3_crops[2]} ({top_3_probs[2]*100:.2f}%)")
    
    print("\n" + "="*50)
    print("MODEL TRAINING COMPLETED SUCCESSFULLY")
    print("="*50)
    
    return model

if __name__ == "__main__":
    train_crop_model()