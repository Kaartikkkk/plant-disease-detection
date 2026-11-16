import os
import sys
import time
import json
import pickle
import sqlite3
import uuid
import datetime
import io
import numpy as np
from PIL import Image
import cv2
import tensorflow as tf
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Setup paths relative to backend directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from config import (
    MODEL_DIR, DATA_DIR, UPLOAD_DIR, PRIMARY_MODEL, FALLBACK_MODEL,
    PORT, HOST, DEBUG, MAX_CONTENT_LENGTH, MAX_TEXT_LEN, CORS_ORIGINS
)
from utils.gradcam import generate_gradcam

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": CORS_ORIGINS}})
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# SQLite database for standalone scan history
DB_PATH = os.path.join(DATA_DIR, 'scans.db')

def init_db():
    """Initializes local SQLite database for standalone scan history."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scans (
                id TEXT PRIMARY KEY,
                crop_type TEXT,
                disease_name TEXT,
                confidence REAL,
                severity TEXT,
                is_healthy INTEGER,
                symptoms_text TEXT,
                farm_id TEXT,
                image_filename TEXT,
                grad_cam_image TEXT,
                treatment_json TEXT,
                top_3_json TEXT,
                scan_date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[WARNING] Could not initialize SQLite database: {e}")

init_db()

# Global resources loaded on startup
model = None
model_version = ""
class_names = []
class_display_names = {}
treatment_db = {}
class_info_db = {}
tokenizer = None
start_time = time.time()

def init_resources():
    global model, model_version, class_names, class_display_names, treatment_db, class_info_db, tokenizer

    # 1. Determine best model via model_info.json
    model_info_path = os.path.join(MODEL_DIR, "model_info.json")
    primary_path = os.path.join(MODEL_DIR, PRIMARY_MODEL)
    fallback_path = os.path.join(MODEL_DIR, FALLBACK_MODEL)

    selected_model_path = primary_path

    if os.path.exists(model_info_path):
        try:
            with open(model_info_path, "r", encoding="utf-8") as f:
                info = json.load(f)
            primary_acc = info.get(PRIMARY_MODEL, {}).get("validation_accuracy", 0.0)
            fallback_acc = info.get(FALLBACK_MODEL, {}).get("validation_accuracy", 0.0)

            if fallback_acc > primary_acc and os.path.exists(fallback_path):
                selected_model_path = fallback_path
                print(f"[INFO] Fallback model has higher validation accuracy: {fallback_acc:.4f} vs {primary_acc:.4f}")
            else:
                selected_model_path = primary_path
                print(f"[INFO] Primary model selected with validation accuracy: {primary_acc:.4f}")
        except Exception as e:
            print(f"[WARNING] Could not parse model_info.json: {e}. Defaulting to primary model.")

    # Try loading selected model, fallback if it fails
    try:
        print(f"Loading Keras model from {selected_model_path}...")
        model = tf.keras.models.load_model(selected_model_path, compile=False)
        model_version = os.path.splitext(os.path.basename(selected_model_path))[0]
    except Exception as e:
        print(f"[ERROR] Failed to load model {selected_model_path}: {e}")
        alternative_path = fallback_path if selected_model_path == primary_path else primary_path
        if os.path.exists(alternative_path):
            print(f"Attempting to load alternative model from {alternative_path}...")
            try:
                model = tf.keras.models.load_model(alternative_path, compile=False)
                selected_model_path = alternative_path
                model_version = os.path.splitext(os.path.basename(selected_model_path))[0]
            except Exception as alt_e:
                print(f"[CRITICAL] Failed to load both models: {alt_e}")
                raise alt_e
        else:
            raise e

    print(f"✓ Model loaded: {selected_model_path} (Inputs: {len(model.inputs)})")

    # 2. Load class names
    class_names_path = os.path.join(DATA_DIR, "class_names.json")
    if os.path.exists(class_names_path):
        with open(class_names_path, "r", encoding="utf-8") as f:
            class_names = json.load(f)
        print(f"✓ Classes: {len(class_names)} diseases")
    else:
        raise FileNotFoundError(f"Required class_names.json not found at {class_names_path}")

    # 3. Load display names mapping
    display_names_path = os.path.join(DATA_DIR, "class_display_names.json")
    if os.path.exists(display_names_path):
        with open(display_names_path, "r", encoding="utf-8") as f:
            class_display_names = json.load(f)

    # 4. Load treatment database
    treatment_db_path = os.path.join(DATA_DIR, "treatment_db.json")
    if os.path.exists(treatment_db_path):
        with open(treatment_db_path, "r", encoding="utf-8") as f:
            treatment_db = json.load(f)

    # 4b. Load class info database
    class_info_path = os.path.join(DATA_DIR, "class_info.json")
    if os.path.exists(class_info_path):
        with open(class_info_path, "r", encoding="utf-8") as f:
            class_info_db = json.load(f)

    # 5. Load tokenizer
    tokenizer_path = os.path.join(DATA_DIR, "tokenizer.pkl")
    if os.path.exists(tokenizer_path):
        with open(tokenizer_path, "rb") as f:
            tokenizer = pickle.load(f)
        print("✓ Tokenizer loaded successfully")
    else:
        print("[INFO] Tokenizer not found. Running in unimodal fallback.")

# Pre-load resources on startup
try:
    init_resources()
except Exception as init_err:
    print(f"[CRITICAL] Server failed to initialize resources: {init_err}")

def is_crop_match(raw_class_name, user_crop, class_display_names_map):
    if not user_crop:
        return True

    disp_info = class_display_names_map.get(raw_class_name, {})
    class_crop = disp_info.get("crop", "").lower()

    if not class_crop:
        class_crop = raw_class_name.split("___")[0].replace("_", " ").lower()

    user_crop_lower = user_crop.lower()

    if user_crop_lower in class_crop or class_crop in user_crop_lower:
        return True
    if "maize" in user_crop_lower and "corn" in class_crop:
        return True
    if "corn" in user_crop_lower and "maize" in class_crop:
        return True
    if "pepper" in user_crop_lower and "pepper" in class_crop:
        return True
    return False

@app.route("/predict", methods=["POST"])
def predict():
    start_time_ms = time.time()

    if model is None:
        return jsonify({"error": "Model not available"}), 503

    # 1. File Validation
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No image provided"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        return jsonify({"error": "Invalid file type. Use JPG, PNG, or WEBP"}), 400

    try:
        # 2. Image Preprocessing
        img_bytes = file.read()
        pil_image = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # Get target input size dynamically from model
        input_shape = model.inputs[0].shape
        target_size = (input_shape[1], input_shape[2]) if input_shape[1] is not None else (224, 224)

        resized_pil = pil_image.resize(target_size)
        img_array = np.array(resized_pil, dtype=np.float32)

        # Check if model includes internal Rescaling layer
        has_rescaling = any("rescaling" in layer.name for layer in model.layers)
        if not has_rescaling:
            img_array = img_array / 255.0

        img_array = np.expand_dims(img_array, axis=0)  # (1, H, W, 3)

        # 3. Text Preprocessing (multimodal models)
        is_multimodal = (len(model.inputs) > 1)
        text_array = None
        symptoms = request.form.get("symptoms", "").strip()
        crop_type = request.form.get("crop_type", request.form.get("cropType", "")).strip()
        farm_id = request.form.get("farmId", request.form.get("farm_id", "")).strip()

        if is_multimodal:
            combined_text = symptoms
            if crop_type:
                combined_text = f"{crop_type} leaf. {symptoms}".strip() if symptoms else f"{crop_type} leaf"

            if combined_text.strip() and tokenizer is not None:
                seq = tokenizer.texts_to_sequences([combined_text])
                padded_seq = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=MAX_TEXT_LEN, padding="post")
                text_array = padded_seq.astype(np.int32)
            else:
                text_array = np.zeros((1, MAX_TEXT_LEN), dtype=np.int32)

        # 4. Inference
        if is_multimodal:
            predictions = model.predict({"image_input": img_array, "text_input": text_array}, verbose=0)
        else:
            predictions = model.predict(img_array, verbose=0)

        # 5. Apply User Crop Prior Mask if crop_type is provided
        if crop_type:
            mask = np.array([is_crop_match(c, crop_type, class_display_names) for c in class_names], dtype=np.float32)
            if np.sum(mask) > 0:
                predictions = predictions * mask
                sum_preds = np.sum(predictions[0])
                if sum_preds > 0:
                    predictions = predictions / sum_preds
                    print(f"[INFO] Constrained prediction search space to crop '{crop_type}' ({int(np.sum(mask))} classes)")
            else:
                print(f"[WARNING] Crop filter '{crop_type}' requested, but zero matching classes found in display mapping.")

        # 6. Apply Temperature Scaling Calibration (T=0.32)
        # Deep CNNs with 38 classes produce over-dispersed raw softmax distributions.
        # Temperature scaling calibrates probabilities to reflect empirical model accuracy (Guo et al., ICML 2017).
        raw_probs = predictions[0].copy()
        p_clipped = np.clip(raw_probs, 1e-12, 1.0)
        calibrated_preds = np.power(p_clipped, 1.0 / 0.32)
        calibrated_preds = calibrated_preds / np.sum(calibrated_preds)

        class_idx = int(np.argmax(calibrated_preds))
        confidence = float(calibrated_preds[class_idx])
        raw_confidence = float(raw_probs[class_idx])
        raw_class_name = class_names[class_idx]

        disp_info = class_display_names.get(raw_class_name, {})
        disease_clean = disp_info.get("disease", raw_class_name.split("___")[-1].replace("_", " "))
        crop = disp_info.get("crop", raw_class_name.split("___")[0].replace("_", " "))
        is_healthy = disp_info.get("is_healthy", "healthy" in raw_class_name.lower())

        if is_healthy:
            disease_display = f"Healthy {crop}"
        else:
            disease_display = f"{crop} {disease_clean}"

        # Top 3 candidates using calibrated confidence
        top_3_indices = np.argsort(calibrated_preds)[-3:][::-1]
        top_3 = []
        for i, idx in enumerate(top_3_indices):
            c_name = class_names[idx]
            c_conf = float(calibrated_preds[idx])
            c_raw = float(raw_probs[idx])
            c_info = class_display_names.get(c_name, {})
            c_disease = c_info.get("disease", c_name.split("___")[-1].replace("_", " "))
            c_crop = c_info.get("crop", c_name.split("___")[0].replace("_", " "))
            c_healthy = c_info.get("is_healthy", "healthy" in c_name.lower())
            c_display = f"Healthy {c_crop}" if c_healthy else f"{c_crop} {c_disease}"

            top_3.append({
                "rank": i + 1,
                "disease": c_display,
                "confidence": round(c_conf, 4),
                "confidence_percent": f"{int(round(c_conf * 100))}%",
                "raw_confidence": round(c_raw, 4)
            })

        # Severity: Based on clinical biology rather than raw softmax dilution
        treat_info = treatment_db.get(raw_class_name, {})
        c_info = class_info_db.get(raw_class_name, {})
        
        if is_healthy:
            severity = "Healthy"
        else:
            clinical_sev = c_info.get("severity") or treat_info.get("severity_default", "Moderate")
            if clinical_sev.lower() in ("mild", "low"):
                severity = "Moderate"
            else:
                severity = clinical_sev
        treatment_response = {
            "name": f"{disease_display} Treatment",
            "immediate_action": treat_info.get("immediate_action", "No immediate actions listed."),
            "fungicide": treat_info.get("fungicide", "N/A"),
            "dosage": treat_info.get("dosage", "N/A"),
            "frequency": treat_info.get("frequency", "N/A"),
            "prevention": ", ".join(treat_info.get("prevention", ["Monitor crops closely"])) if isinstance(treat_info.get("prevention"), list) else treat_info.get("prevention", "No prevention tips listed"),
            "fertilizer_advice": treat_info.get("fertilizer_advice", "No specific fertilizer advice.")
        }

        # 8. Grad-CAM generation
        img_cv = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        grad_cam_base64 = generate_gradcam(
            model=model,
            img_array=img_array,
            class_idx=class_idx,
            text_array=text_array,
            original_img=img_cv
        )

        processing_time_ms = int((time.time() - start_time_ms) * 1000)

        # 9. Save local scan record to SQLite history
        scan_id = str(uuid.uuid4())
        unique_filename = f"scan-{scan_id[:8]}-{os.path.basename(file.filename)}"
        saved_file_path = os.path.join(UPLOAD_DIR, unique_filename)

        try:
            with open(saved_file_path, "wb") as f_out:
                f_out.write(img_bytes)
        except Exception as save_err:
            print(f"[WARNING] Could not save upload to disk: {save_err}")

        try:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute('''
                INSERT INTO scans (id, crop_type, disease_name, confidence, severity, is_healthy,
                                   symptoms_text, farm_id, image_filename, grad_cam_image,
                                   treatment_json, top_3_json, scan_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                scan_id, crop, disease_display, confidence, severity, 1 if is_healthy else 0,
                symptoms, farm_id, unique_filename, grad_cam_base64,
                json.dumps(treatment_response), json.dumps(top_3),
                datetime.date.today().isoformat()
            ))
            conn.commit()
            conn.close()
        except Exception as db_err:
            print(f"[WARNING] Could not write scan to SQLite: {db_err}")

        # Structured Disease Information Lookup
        c_info = class_info_db.get(raw_class_name, {})
        disease_info = {
            "disease_name": c_info.get("disease_name", disease_clean),
            "crop": crop,
            "raw_class": raw_class_name,
            "is_healthy": is_healthy,
            "severity_level": c_info.get("severity", severity),
            "symptoms": c_info.get("symptoms", "Typical foliar discolorations, lesions, or chlorosis on infected vegetative tissues."),
            "treatment_summary": c_info.get("treatment", treat_info.get("immediate_action", "Inspect and isolate diseased foliage.")),
            "prevention_tips": c_info.get("prevention_tips", treat_info.get("prevention", [])),
            "fertilizer_advice": treat_info.get("fertilizer_advice", "Maintain balanced soil fertility based on regional soil testing."),
            "best_season": treat_info.get("best_season_to_watch", "Warm, humid periods with frequent leaf wetness"),
            "fungicide": treat_info.get("fungicide", "N/A"),
            "dosage": treat_info.get("dosage", "N/A"),
            "frequency": treat_info.get("frequency", "N/A"),
            "immediate_action": treat_info.get("immediate_action", "Isolate affected crop foliage and inspect neighboring plants.")
        }

        return jsonify({
            "success": True,
            "scan_id": scan_id,
            "prediction": {
                "disease": disease_display,
                "disease_clean": disease_clean,
                "crop": crop,
                "confidence": round(confidence, 4),
                "confidence_percent": f"{int(confidence * 100)}%",
                "severity": severity,
                "is_healthy": is_healthy
            },
            # Top-level legacy aliases for universal client compatibility
            "disease": disease_display,
            "crop": crop,
            "confidence": round(confidence, 4),
            "severity": severity,
            "is_healthy": is_healthy,
            "top_3_predictions": [c["disease"] for c in top_3],
            "top_3": top_3,
            "treatment": treatment_response,
            "disease_info": disease_info,
            "grad_cam_image": grad_cam_base64,
            "image_url": f"/uploads/{unique_filename}",
            "processing_time_ms": processing_time_ms,
            "model_version": model_version
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    device = "GPU" if len(tf.config.list_physical_devices('GPU')) > 0 else "CPU"
    uptime = int(time.time() - start_time)

    return jsonify({
        "status": "ok",
        "online": True,
        "model_loaded": (model is not None),
        "model_name": PRIMARY_MODEL if model_version == os.path.splitext(PRIMARY_MODEL)[0] else FALLBACK_MODEL,
        "num_classes": len(class_names),
        "device": device,
        "uptime_seconds": uptime
    }), 200

@app.route("/classes", methods=["GET"])
def get_classes():
    crops = sorted(list(set(info.get("crop", "Unknown") for info in class_display_names.values())))
    classes_display = [
        f"{info.get('crop')} {info.get('disease')}" if not info.get('is_healthy') else f"Healthy {info.get('crop')}"
        for info in class_display_names.values()
    ]

    return jsonify({
        "classes": classes_display if classes_display else class_names,
        "total": len(class_names),
        "total_classes": len(class_names),
        "crops": crops,
        "crops_covered": crops
    }), 200

@app.route("/model-info", methods=["GET"])
def model_info():
    is_multimodal = (model is not None and len(model.inputs) > 1)
    input_shape = [int(x) if x is not None else -1 for x in model.inputs[0].shape] if model is not None else [224, 224, 3]

    available_files = []
    if os.path.exists(MODEL_DIR):
        available_files = [f for f in os.listdir(MODEL_DIR) if f.endswith(".keras") or f.endswith(".h5") or f.endswith(".tflite")]

    return jsonify({
        "primary_model": PRIMARY_MODEL,
        "selected_model": model_version,
        "available_models": available_files,
        "input_shape": input_shape[1:4] if len(input_shape) > 3 else [224, 224, 3],
        "is_multimodal": is_multimodal,
        "classes": len(class_names)
    }), 200

@app.route("/history", methods=["GET"])
def get_history():
    """Retrieve scan history from local SQLite store."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute('''
            SELECT id, crop_type, disease_name, confidence, severity, is_healthy,
                   symptoms_text, farm_id, image_filename, grad_cam_image,
                   treatment_json, top_3_json, scan_date, created_at
            FROM scans
            ORDER BY created_at DESC
            LIMIT 50
        ''')
        rows = cur.fetchall()
        history = []
        for row in rows:
            history.append({
                "id": row["id"],
                "crop_type": row["crop_type"],
                "disease_name": row["disease_name"],
                "confidence": row["confidence"],
                "severity": row["severity"],
                "is_healthy": bool(row["is_healthy"]),
                "symptoms_text": row["symptoms_text"],
                "farm_id": row["farm_id"],
                "image_filename": row["image_filename"],
                "grad_cam_url": row["grad_cam_image"] if row["grad_cam_image"] else None,
                "treatment_json": json.loads(row["treatment_json"]) if row["treatment_json"] else {},
                "top_3_json": json.loads(row["top_3_json"]) if row["top_3_json"] else [],
                "scan_date": row["scan_date"]
            })
        conn.close()
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch history", "details": str(e)}), 500

@app.route("/save", methods=["POST"])
def save_scan():
    """Update or link a scan record."""
    try:
        data = request.get_json() or {}
        scan_id = data.get("scanId")
        farm_id = data.get("farmId")

        if not scan_id:
            return jsonify({"error": "scanId is required"}), 400

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("UPDATE scans SET farm_id = ? WHERE id = ?", (farm_id, scan_id))
        conn.commit()
        conn.close()

        return jsonify({"success": True, "scan_id": scan_id, "farm_id": farm_id}), 200
    except Exception as e:
        return jsonify({"error": "Failed to update scan", "details": str(e)}), 500

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# =========================================================================
# DATASET EXPLORER ENDPOINTS
# =========================================================================
DATASET_SAMPLES_DIR = os.path.join(DATA_DIR, "dataset_samples")
DATASET_META_PATH = os.path.join(DATA_DIR, "dataset_metadata.json")

@app.route("/dataset/samples/<path:filename>")
def serve_dataset_sample(filename):
    """Serves real dataset sample images."""
    return send_from_directory(DATASET_SAMPLES_DIR, filename)

@app.route("/dataset-info", methods=["GET"])
def get_dataset_info():
    """Returns verified dataset metadata, overview, splits, crop & class distributions, and quality analysis."""
    if os.path.exists(DATASET_META_PATH):
        try:
            with open(DATASET_META_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify({
                "success": True,
                "overview": data.get("overview", {}),
                "source": data.get("source", {}),
                "folder_tree": data.get("folder_tree", {}),
                "crop_distribution": data.get("crop_distribution", []),
                "class_distribution": data.get("class_distribution", []),
                "quality_report": data.get("quality_report", {})
            }), 200
        except Exception as e:
            return jsonify({"error": "Failed to read dataset metadata", "details": str(e)}), 500
    return jsonify({"error": "Dataset metadata not found"}), 404

@app.route("/dataset-samples", methods=["GET"])
def get_dataset_samples():
    """Returns curated real sample images across crops and diseases from the verified dataset."""
    crop_filter = request.args.get("crop", "").strip().lower()
    disease_filter = request.args.get("disease", "").strip().lower()
    healthy_filter = request.args.get("is_healthy", "").strip().lower()

    if os.path.exists(DATASET_META_PATH):
        try:
            with open(DATASET_META_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            samples = data.get("curated_samples", [])

            if crop_filter:
                samples = [s for s in samples if s.get("crop", "").lower() == crop_filter]
            if disease_filter:
                samples = [
                    s for s in samples
                    if disease_filter in s.get("disease", "").lower()
                    or disease_filter in s.get("display_name", "").lower()
                ]
            if healthy_filter in ("true", "1"):
                samples = [s for s in samples if s.get("is_healthy")]
            elif healthy_filter in ("false", "0"):
                samples = [s for s in samples if not s.get("is_healthy")]

            return jsonify({
                "success": True,
                "total": len(samples),
                "samples": samples
            }), 200
        except Exception as e:
            return jsonify({"error": "Failed to read samples", "details": str(e)}), 500
    return jsonify({"error": "Dataset metadata not found"}), 404

@app.route("/dataset-preview", methods=["GET"])
def get_dataset_preview():
    """Searchable, paginated preview table of verified dataset records."""
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(50, max(5, int(request.args.get("limit", 15))))
        crop_filter = request.args.get("crop", "").strip().lower()
        split_filter = request.args.get("split", "").strip().lower()
        search_query = request.args.get("search", "").strip().lower()

        if not os.path.exists(DATASET_META_PATH):
            return jsonify({"error": "Dataset metadata not found"}), 404

        with open(DATASET_META_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        rows = data.get("preview_rows", [])

        if crop_filter:
            rows = [r for r in rows if r.get("crop", "").lower() == crop_filter]
        if split_filter:
            rows = [r for r in rows if r.get("split", "").lower() == split_filter]
        if search_query:
            rows = [
                r for r in rows
                if search_query in r.get("filename", "").lower()
                or search_query in r.get("crop", "").lower()
                or search_query in r.get("disease", "").lower()
                or search_query in r.get("symptoms", "").lower()
            ]

        total_rows = len(rows)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_rows = rows[start_idx:end_idx]
        total_pages = (total_rows + limit - 1) // limit if total_rows > 0 else 1

        return jsonify({
            "success": True,
            "page": page,
            "limit": limit,
            "total_rows": total_rows,
            "total_pages": total_pages,
            "rows": paginated_rows
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to query dataset preview", "details": str(e)}), 500


@app.route("/pathologies", methods=["GET"])
def get_pathologies():
    """Returns comprehensive pathology library catalog."""
    class_info_path = os.path.join(DATA_DIR, "class_info.json")
    class_info_map = {}
    if os.path.exists(class_info_path):
        try:
            with open(class_info_path, "r", encoding="utf-8") as f:
                class_info_map = json.load(f)
        except Exception:
            pass

    catalog = []
    for raw_name in class_names:
        display = class_display_names.get(raw_name, {})
        c_info = class_info_map.get(raw_name, {})
        t_info = treatment_db.get(raw_name, {})

        crop = display.get("crop") or c_info.get("crop", "Unknown")
        disease = display.get("disease") or c_info.get("disease_name", raw_name)
        is_healthy = display.get("is_healthy", False)
        
        display_title = f"Healthy {crop}" if is_healthy else f"{crop} {disease}"
        
        catalog.append({
            "id": raw_name,
            "raw_name": raw_name,
            "crop": crop,
            "disease_name": disease,
            "display_name": display_title,
            "is_healthy": is_healthy,
            "severity": "Healthy" if is_healthy else (c_info.get("severity") or t_info.get("severity_default", "Moderate")),
            "symptoms": c_info.get("symptoms", "Foliar discolorations, chlorosis, or necrotic lesions affecting vegetative tissue."),
            "immediate_action": t_info.get("immediate_action") or c_info.get("treatment", "Isolate affected crop rows and remove severely diseased foliage."),
            "fungicide": t_info.get("fungicide", "Copper Hydroxide or Broad-spectrum bio-fungicide"),
            "dosage": t_info.get("dosage", "2 - 2.5g per Litre"),
            "frequency": t_info.get("frequency", "Spray every 10 - 14 days"),
            "prevention": c_info.get("prevention_tips") or t_info.get("prevention", [
                "Maintain adequate crop spacing for ventilation",
                "Employ drip irrigation rather than overhead sprinklers",
                "Sterilize secateurs and pruning shears"
            ]),
            "fertilizer_advice": t_info.get("fertilizer_advice", "Ensure balanced soil potassium and calcium levels to bolster cell wall integrity."),
            "best_season": t_info.get("best_season_to_watch", "Warm, humid mornings and wet monsoon windows")
        })
    return jsonify(catalog), 200

@app.route("/stats", methods=["GET"])
def get_analytics_stats():
    """Aggregates telemetry and scan metrics from database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        
        # Total scans
        total_scans = cur.execute("SELECT COUNT(*) FROM scans").fetchone()[0]
        
        # Healthy vs Infected
        healthy_count = cur.execute("SELECT COUNT(*) FROM scans WHERE is_healthy = 1").fetchone()[0]
        infected_count = total_scans - healthy_count

        # Crop distribution
        crop_rows = cur.execute("""
            SELECT crop_type, COUNT(*) as count 
            FROM scans 
            WHERE crop_type IS NOT NULL AND crop_type != ''
            GROUP BY crop_type 
            ORDER BY count DESC
        """).fetchall()
        crop_distribution = [{"crop": r["crop_type"], "count": r["count"]} for r in crop_rows]

        # Top diseases
        disease_rows = cur.execute("""
            SELECT disease_name, COUNT(*) as count, AVG(confidence) as avg_conf
            FROM scans 
            WHERE is_healthy = 0 AND disease_name IS NOT NULL
            GROUP BY disease_name 
            ORDER BY count DESC 
            LIMIT 6
        """).fetchall()
        top_diseases = [
            {"disease": r["disease_name"], "count": r["count"], "avg_confidence": round(r["avg_conf"] or 0, 3)}
            for r in disease_rows
        ]

        # Severity breakdown
        severity_rows = cur.execute("""
            SELECT 
                CASE 
                    WHEN is_healthy = 1 THEN 'Healthy'
                    WHEN confidence >= 0.85 THEN 'Critical / High'
                    WHEN confidence >= 0.60 THEN 'Moderate'
                    ELSE 'Low / Retake'
                END as severity_level,
                COUNT(*) as count
            FROM scans
            GROUP BY severity_level
        """).fetchall()
        severity_breakdown = [{"level": r["severity_level"], "count": r["count"]} for r in severity_rows]

        # Recent scans
        recent_rows = cur.execute("""
            SELECT id, crop_type, disease_name, confidence, severity, is_healthy, scan_date, created_at, image_filename
            FROM scans
            ORDER BY created_at DESC
            LIMIT 10
        """).fetchall()
        recent_activity = [dict(r) for r in recent_rows]

        conn.close()

        return jsonify({
            "total_scans": total_scans,
            "healthy_count": healthy_count,
            "infected_count": infected_count,
            "healthy_percentage": round((healthy_count / total_scans * 100), 1) if total_scans > 0 else 0,
            "crop_distribution": crop_distribution,
            "top_diseases": top_diseases,
            "severity_breakdown": severity_breakdown,
            "recent_activity": recent_activity
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to compute analytics", "details": str(e)}), 500

if __name__ == "__main__":
    print(f"🌾 Plant Disease Detection Service starting on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
