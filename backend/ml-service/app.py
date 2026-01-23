from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.getenv('MODEL_PATH', 'models/crop_model.pkl')

try:
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK',
        'message': 'ML Service is running',
        'model_loaded': model is not None
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({
            'success': False,
            'message': 'Model not loaded. Please train the model first.'
        }), 500
    
    try:
        data = request.get_json()
        
        required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        input_features = [[
            float(data['N']),
            float(data['P']),
            float(data['K']),
            float(data['temperature']),
            float(data['humidity']),
            float(data['ph']),
            float(data['rainfall'])
        ]]
        
        probabilities = model.predict_proba(input_features)[0]
        
        top_3_indices = np.argsort(probabilities)[-3:][::-1]
        top_3_crops = [model.classes_[i] for i in top_3_indices]
        top_3_probs = [float(probabilities[i]) for i in top_3_indices]
        
        response = {
            'success': True,
            'primary_crop': top_3_crops[0],
            'primary_confidence': round(top_3_probs[0] * 100, 2),
            'other_recommendations': [
                {
                    'crop': top_3_crops[1],
                    'confidence': round(top_3_probs[1] * 100, 2)
                },
                {
                    'crop': top_3_crops[2],
                    'confidence': round(top_3_probs[2] * 100, 2)
                }
            ],
            'input_parameters': data
        }
        
        return jsonify(response), 200
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': f'Invalid input values: {str(ve)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Prediction error: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)