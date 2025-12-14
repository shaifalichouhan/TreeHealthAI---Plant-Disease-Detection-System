🌱 TreeHealthAI - Plant Disease Detection System
AI-powered web application that detects plant diseases from leaf images using a deep learning model built on MobileNetV2 and deployed with a Flask backend.

🎯 Project Overview
TreeHealthAI allows users to upload a plant leaf image and receive an instant prediction of the disease, along with description, causes, prevention tips, and treatment recommendations.
The system uses a pre-trained MobileNetV2 model fine‑tuned on a plant disease dataset and exposes a simple web interface for non-technical users.

🌟 Features
Image upload (drag & drop or file picker)

Real-time plant disease prediction

Confidence score visualization with animated progress bar

Detailed disease description, causes, prevention, and treatment

Modern UI with glassmorphism, animations, and responsive design

Keyboard shortcuts and smooth scroll interactions

🛠️ Technology Stack
Backend / AI

Python

Flask

TensorFlow / Keras (MobileNetV2)

NumPy

Pillow / OpenCV (image handling)

Frontend

HTML5, CSS3, JavaScript

Bootstrap 5

Font Awesome Icons

AOS (Animate On Scroll)

Particles.js

📁 Project Structure
text
TreeHealthAI/
├── app.py
├── requirements.txt
├── diseases.json
├── README.md
├── model/
│   └── plant_disease_model.h5
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── favicon/
│   │   └── (favicon files if any)
│   └── images/
│       └── (optional static images)
└── templates/
    └── index.html
📦 Installation and Setup
1. Clone the Repository
bash
git clone https://github.com/YOUR_USERNAME/TreeHealthAI.git
cd TreeHealthAI
2. Create and Activate Virtual Environment
bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
3. Install Dependencies
bash
pip install -r requirements.txt
4. Run the Application Locally
Make sure plant_disease_model.h5 is placed inside the model/ folder and diseases.json is in the project root.

bash
python app.py
Then open in your browser:

text
http://127.0.0.1:5000
🔍 How It Works
Upload Image
The user uploads a plant leaf image through the web interface.

Preprocessing

Image is resized to the input size expected by the model (e.g., 224×224).

Pixel values are scaled/normalized.

Model Inference

The pre-trained MobileNetV2-based model predicts probabilities for all disease classes.

The class with the highest probability is selected as the final prediction.

Result Rendering

Disease name and confidence score are displayed.

Additional information (description, causes, prevention, treatment) is loaded from diseases.json.

🧪 API Endpoint
POST /predict
Request

Content-Type: multipart/form-data

Body parameter: file – uploaded image

Response (example)

json
{
  "success": true,
  "predicted_class": "Tomato___Late_blight",
  "confidence": 0.96,
  "disease_name": "Tomato Late Blight",
  "description": "Short description of the disease.",
  "health_status": "Critical",
  "causes": [
    "Cause 1",
    "Cause 2"
  ],
  "prevention": [
    "Prevention tip 1",
    "Prevention tip 2"
  ],
  "treatment": [
    "Treatment step 1",
    "Treatment step 2"
  ]
}
🚀 Deployment (General Steps)
You can deploy this project on platforms that support Python web apps, such as Render, Railway, or any VPS.

Typical production setup:

Ensure requirements.txt includes a production server (e.g., gunicorn).

In app.py, bind to all interfaces and read port from environment:

python
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
Use a start command similar to:

bash
gunicorn app:app
Upload the repository (with model/plant_disease_model.h5 and diseases.json) to your hosting platform and configure build/start commands according to their documentation.

🔒 Notes and Limitations
Predictions are based on the training dataset and are not a substitute for professional agricultural advice.

Image quality (lighting, focus, background) strongly affects accuracy.

Very severe or rare conditions not present in the training data may not be classified correctly.

📚 Possible Improvements
Add user authentication and history of analyzed images.

Support multiple images in a single request.

Add language localization for non-English users.

Convert model to TensorFlow Lite and deploy on mobile devices.

Integrate weather and location data for richer agronomy insights.

👤 Author
Name: Shaifali

Email: sofiyachouhan1312@gmail.com

GitHub: https://github.com/shaifalichouhan

📝 License
This project is intended for educational and research purposes.
You may modify and use the code as permitted by your institution or organization’s guidelines.

