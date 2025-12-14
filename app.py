from flask import Flask, render_template, request, jsonify
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import json
import os

# Initialize Flask app
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

# Load the pre-trained model
print("=" * 60)
print("🚀 LOADING AI MODEL...")
print("=" * 60)

MODEL_PATH = 'model/plant_disease_model.h5'

try:
    model = keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully!")
    print(f"📁 Model path: {MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Load disease information
DISEASE_INFO_PATH = 'diseases.json'

try:
    with open(DISEASE_INFO_PATH, 'r', encoding='utf-8') as f:
        disease_info = json.load(f)
    print(f"✅ Disease database loaded: {len(disease_info)} diseases")
except Exception as e:
    print(f"❌ Error loading disease info: {e}")
    disease_info = {}

# Class names (38 PlantVillage classes in order)
CLASS_NAMES = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

print(f"✅ {len(CLASS_NAMES)} disease classes configured")
print("=" * 60)

# Preprocessing function
def preprocess_image(image_file):
    """
    Preprocess uploaded image for model prediction
    - Resize to 224x224
    - Normalize pixel values to [0, 1]
    - Add batch dimension
    """
    try:
        # Open image
        img = Image.open(image_file)
        
        # Convert to RGB (in case of RGBA or grayscale)
        img = img.convert('RGB')
        
        # Resize to 224x224 (MobileNetV2 input size)
        img = img.resize((224, 224))
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Normalize to [0, 1]
        img_array = img_array.astype('float32') / 255.0
        
        # Add batch dimension (model expects batch of images)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

# Calculate health status
def calculate_health_status(predicted_class, confidence):
    """
    Determine health status based on disease and confidence
    """
    if 'healthy' in predicted_class.lower():
        if confidence >= 0.85:
            return 'Healthy'
        else:
            return 'Mild Disease'
    else:
        if confidence >= 0.75:
            return 'Critical'
        elif confidence >= 0.50:
            return 'Mild Disease'
        else:
            return 'Needs Further Analysis'

# Routes
@app.route('/')
def home():
    """Render main page"""
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    """
    Handle image upload and prediction
    Returns JSON with disease info
    """
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Check file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': 'Invalid file type. Use JPG, PNG, or GIF'}), 400
        
        print(f"📸 Processing image: {file.filename}")
        
        # Preprocess image
        img_array = preprocess_image(file)
        
        if img_array is None:
            return jsonify({'error': 'Error processing image'}), 500
        
        # Make prediction
        print("🔮 Running AI prediction...")
        predictions = model.predict(img_array, verbose=0)
        
        # Get predicted class
        predicted_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_idx])
        predicted_class = CLASS_NAMES[predicted_idx]
        
        print(f"✅ Prediction: {predicted_class} ({confidence*100:.2f}%)")
        
        # Get disease information
        disease_data = disease_info.get(predicted_class, {
            'disease_name': 'Unknown Disease',
            'description': 'No information available',
            'causes': ['Unknown'],
            'prevention': ['Consult an expert'],
            'treatment': ['Professional diagnosis required']
        })
        
        # Calculate health status
        health_status = calculate_health_status(predicted_class, confidence)
        
        # Prepare response
        response = {
            'success': True,
            'predicted_class': predicted_class,
            'confidence': confidence,
            'disease_name': disease_data['disease_name'],
            'description': disease_data['description'],
            'health_status': health_status,
            'causes': disease_data['causes'],
            'prevention': disease_data['prevention'],
            'treatment': disease_data['treatment']
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"❌ Error in prediction: {e}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

# Health check endpoint
@app.route('/health')
def health_check():
    """Check if API is working"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'disease_database_loaded': len(disease_info) > 0,
        'total_classes': len(CLASS_NAMES)
    })

# Error handlers
@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 10MB'}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# Run app
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)