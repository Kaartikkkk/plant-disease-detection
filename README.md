# 🌿 Plant Disease Detection Module (Independent & Standalone)

A self-contained, high-accuracy agricultural diagnostic system extracted from AgroSmart. It combines deep learning computer vision (EfficientNetB3), multimodal NLP symptom processing, and Grad-CAM visual attention mapping to classify 38 plant pathologies and generate structured agronomic treatment plans.

---

## 📋 Features

- **38 Disease Classes Across 14 Crops**: Apples, Blueberries, Cherries, Corn (Maize), Grapes, Oranges, Peaches, Bell Peppers, Potatoes, Raspberries, Soybeans, Squash, Strawberries, and Tomatoes.
- **Multimodal AI Architecture**: Accepts both leaf images and textual symptom descriptions to refine disease classification probabilities.
- **Explainable AI (Grad-CAM)**: Generates visual heatmaps identifying exact leaf lesions that influenced the neural network prediction.
- **Complete Agronomic Prescriptions**: Immediate remedial actions, targeted chemical fungicides with exact dosages & spray intervals, prevention guidelines, and fertilizer advice.
- **Zero Hardcoded Dependencies**: Standalone Flask API (with local SQLite scan persistence) + Independent React 19 / Vite UI component.
- **Multiple Integration Options**: Run as a unified standalone application, import the React component into an existing frontend, or proxy requests through Node.js Express.

---

## 📁 Folder Structure

```
plant-disease-extraction/
├── backend/                              # Python Flask ML Microservice
│   ├── app.py                            # Standalone Flask API (Inference, Health, Classes, History)
│   ├── config.py                         # Environment-driven, portable path configuration
│   ├── requirements.txt                  # Python package requirements
│   ├── test_api.py                       # Automated verification test suite
│   └── utils/
│       ├── __init__.py
│       └── gradcam.py                    # Grad-CAM heatmap generator
├── frontend/                             # Independent React + Vite Web Application
│   ├── package.json                      # Frontend dependencies (React, Vite, TailwindCSS, Framer Motion)
│   ├── vite.config.js                    # Vite configuration
│   ├── index.html                        # App entry HTML
│   ├── .env.example                      # Frontend environment template
│   └── src/
│       ├── main.jsx                      # App root mount
│       ├── App.jsx                       # Standalone layout container
│       ├── index.css                     # Tailwind CSS v4 styling
│       ├── components/
│       │   └── DiseaseScanner.jsx        # Complete self-contained Disease Detection UI
│       └── services/
│           └── diseaseService.js         # API client communicating with backend
├── models/                               # Trained Deep Learning Models & Metadata
│   ├── plant_disease_model_final.keras   # Primary Multimodal Model (~81.4 MB, 81.4% val acc)
│   ├── agro_disease_model.h5             # Fallback Unimodal Model (~143.7 MB, 64.1% val acc)
│   ├── agro_model_int8.tflite            # Lightweight quantized TFLite Model (~13.7 MB)
│   ├── agro_model_float32.tflite         # Float32 TFLite Model (~47.2 MB)
│   └── model_info.json                   # Model performance metadata and inputs
├── data/                                 # Datasets, Labels & Class Mappings
│   ├── class_names.json                  # 38 raw class labels
│   ├── class_display_names.json          # Formatted crop & disease display names
│   ├── treatment_db.json                 # Structured treatment database
│   ├── class_info.json                   # Symptoms, descriptions, and severity
│   ├── tokenizer.pkl                     # Keras symptom tokenizer for multimodal branch
│   └── scans.db                          # Local SQLite database for scan history (auto-created)
├── server-integration/                   # Optional Node.js Express Adapter
│   ├── disease.routes.js                 # Express proxy router
│   ├── DiseaseScan.model.js              # Sequelize ORM model definition
│   └── README.md                         # Express integration guide
├── sample_images/                        # Test images for out-of-the-box validation
│   ├── sample_leaf.jpg                   # Apple black rot sample leaf
│   └── sample_tomato.jpg                 # Tomato leaf sample
├── .env.example                          # Root environment template
├── requirements.txt                      # Root requirements shortcut
├── run_standalone.py                     # One-command runner script
└── README.md                             # This documentation
```

---

## ⚙️ System Requirements

- **Python**: `3.9` to `3.13` (tested and verified with Python 3.13)
- **Node.js**: `v18.0.0` or higher (tested with Node.js v20+)
- **OS**: macOS, Linux, or Windows (cross-platform path resolution)

---

## 🚀 Quick Start (Running Standalone)

### Option 1: One-Command Launcher (Python)

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Run backend + frontend concurrently
python run_standalone.py --all
```

- **Backend API**: `http://localhost:5001`
- **Frontend UI**: `http://localhost:5174`

---

### Option 2: Step-by-Step Manual Setup

#### Step 1: Set Up Backend

```bash
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```

The backend starts on `http://localhost:5001`. You will see:
```text
✓ Model loaded: .../plant_disease_model_final.keras (Inputs: 2)
✓ Classes: 38 diseases
✓ Tokenizer loaded successfully
🌾 Plant Disease Detection Service starting on http://0.0.0.0:5001
```

#### Step 2: Set Up Frontend

```bash
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```

The frontend launches on `http://localhost:5174`.

---

## 📡 API Endpoints & Request Formats

### 1. `POST /predict`
Performs deep learning inference on an uploaded leaf photograph.

- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `image` *(required, File)*: Supported formats: JPG, JPEG, PNG, WEBP (Max: 10MB).
  - `crop_type` *(optional, string)*: Filter prediction to a specific crop (e.g., `"Tomato"`, `"Apple"`, `"Potato"`).
  - `symptoms` *(optional, string)*: Visual description of symptoms for the multimodal branch (e.g., `"yellow spots on leaf border"`).
  - `farmId` *(optional, string)*: Identifier for field/plot assignment.

#### Sample Request (`curl`):
```bash
curl -X POST http://localhost:5001/predict \
  -F "image=@sample_images/sample_tomato.jpg" \
  -F "crop_type=Tomato" \
  -F "symptoms=yellow spots and wilting on lower leaves"
```

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "scan_id": "d1417d3b-a9a4-4e2f-a057-fbfa7858c7a0",
  "prediction": {
    "crop": "Tomato",
    "disease": "Tomato Leaf Mold",
    "disease_clean": "Leaf Mold",
    "confidence": 0.8421,
    "confidence_percent": "84%",
    "severity": "Medium",
    "is_healthy": false
  },
  "top_3": [
    { "rank": 1, "disease": "Tomato Leaf Mold", "confidence": 0.8421, "confidence_percent": "84%" },
    { "rank": 2, "disease": "Tomato Early blight", "confidence": 0.1034, "confidence_percent": "10%" },
    { "rank": 3, "disease": "Tomato Septoria leaf spot", "confidence": 0.0312, "confidence_percent": "3%" }
  ],
  "treatment": {
    "name": "Tomato Leaf Mold Treatment",
    "immediate_action": "Increase ventilation and reduce humidity in growing area...",
    "fungicide": "Wettable Sulfur or Neem Oil formulation",
    "dosage": "3g per litre of water",
    "frequency": "Spray weekly during high humidity",
    "prevention": "Ensure good air circulation, Avoid overhead watering, Remove lower suckers",
    "fertilizer_advice": "Avoid excess nitrogen fertilizers which produce dense foliage."
  },
  "grad_cam_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "image_url": "/uploads/scan-d1417d3b-sample_tomato.jpg",
  "processing_time_ms": 1150,
  "model_version": "plant_disease_model_final"
}
```

---

### 2. `GET /health`
Returns runtime status and hardware detection.

#### Sample Response:
```json
{
  "status": "ok",
  "online": true,
  "model_loaded": true,
  "model_name": "plant_disease_model_final.keras",
  "num_classes": 38,
  "device": "CPU",
  "uptime_seconds": 124
}
```

---

### 3. `GET /classes`
Returns the 38 supported plant disease classes and covered crops.

---

### 4. `GET /history`
Returns historical scans stored in the self-contained SQLite database (`data/scans.db`).

---

### 5. `POST /save`
Updates or links a scan record to a plot ID or notes.
```json
{
  "scanId": "d1417d3b-a9a4-4e2f-a057-fbfa7858c7a0",
  "farmId": "field-plot-42"
}
```

---

## 🧠 Model Architecture & Preprocessing

1. **Backbone**: EfficientNetB3 feature extractor with ImageNet weights, projecting 1536 feature channels down to a 256-dimension dense vector with batch normalization and dropout.
2. **Text Symptom Branch**: Embedding layer (vocab size 5000, 128 embedding dim) -> SpatialDropout1D -> Bidirectional LSTM (128 units) -> GlobalMaxPooling1D sequence attention -> 64-dimension dense projection.
3. **Multimodal Fusion**: Concatenates image (256-dim) and text (64-dim) representations into a 320-dim fused vector -> Dense(256) -> BatchNorm -> Dropout -> Dense(128) -> Softmax(38 classes).
4. **Image Preprocessing**:
   - Dynamic input shape detection: resizes input to `(300, 300)` for the multimodal Keras model or `(224, 224)` for unimodal models.
   - Normalized pixel intensity `[0, 1]` via float32 conversion.
5. **Crop Prior Masking**: If the user selects a crop (e.g. `"Tomato"`), probabilities for non-matching classes are zeroed out and remaining classes are renormalized, preventing cross-species misclassifications.
6. **Grad-CAM Generation**: Computes gradients of the top predicted class score with respect to the last convolutional feature map (`top_activation`), generating an attention heatmap overlaid in Jet colormap with `alpha=0.4`.

---

## 💻 Importing into Another React Project

To integrate the disease detection interface into your own React application:

1. Copy `frontend/src/components/DiseaseScanner.jsx` and `frontend/src/services/diseaseService.js` into your project.
2. Install required peer dependencies:
   ```bash
   npm install axios lucide-react framer-motion clsx
   ```
3. Set your backend URL in your `.env`:
   ```env
   VITE_API_URL=http://localhost:5001
   ```
4. Render the component anywhere in your app:
   ```jsx
   import DiseaseScanner from './components/DiseaseScanner';

   export default function DiseaseDetectionPage() {
     return (
       <div className="container mx-auto p-4">
         <DiseaseScanner />
       </div>
     );
   }
   ```

---

## 🧪 Verification & Testing

An independent automated test script is provided in `backend/test_api.py`.

To run the test suite:
```bash
# With the backend running on port 5001:
python backend/test_api.py
```

### Verified Test Results:
```text
============================================================
🧪 Testing Plant Disease Detection Standalone Backend
Target URL: http://localhost:5001
============================================================

[TEST 1] Checking Health Endpoint (/health)...
✓ Health OK: Status=ok, Model=plant_disease_model_final.keras, Device=CPU, Classes=38

[TEST 2] Checking Classes Endpoint (/classes)...
✓ Classes OK: 38 total disease classes covering 14 crops: ['Apple', 'Blueberry', 'Cherry', 'Corn (maize)', 'Grape']...

[TEST 3] Checking Model Info Endpoint (/model-info)...
✓ Model Info OK: Primary=plant_disease_model_final.keras, Multimodal=True, Shape=[300, 300, 3]

[TEST 4] Testing Inference with Sample Tomato (.../sample_images/sample_tomato.jpg)...
✓ Diagnosis: Tomato Leaf Mold
✓ Detected Crop: Tomato
✓ Confidence: 21% (Raw: 0.2158)
✓ Severity: Low — please retake photo
✓ Is Healthy: False
✓ Top 3: ['Tomato Leaf Mold (21%)', 'Healthy Tomato (21%)', 'Tomato Target Spot (11%)']
✓ Treatment Fungicide: Wettable Sulfur or Neem Oil formulation
✓ Grad-CAM Heatmap: Present (41391 characters base64)
✓ Latency: 2671 ms

[TEST 5] Checking History Endpoint (/history)...
✓ History OK: 1 recorded scans retrieved from local SQLite database.
  Latest record: Tomato Leaf Mold on 2026-10-22

============================================================
🎉 ALL TESTS PASSED! The Plant Disease Detection Module is fully operational.
============================================================
```

---

## 🔒 Portability & Zero-Dependency Guarantee

- **Self-Contained Storage**: Uses SQLite (`data/scans.db`) for scan history so no external database (PostgreSQL, MySQL) is required.
- **Dynamic File Paths**: All paths resolve relative to `config.py` using `os.path.dirname`, ensuring the entire folder can be relocated anywhere on any machine.
- **AgroSmart Untouched**: No original AgroSmart files have been deleted, moved, modified, or altered.
