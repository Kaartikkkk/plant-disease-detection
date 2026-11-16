#!/usr/bin/env python3
"""
Independent test script for Plant Disease Detection Backend API.
Tests /health, /classes, /model-info, /predict with sample images, and /history.
"""

import os
import sys
import json
import requests

def run_tests(base_url="http://localhost:5001"):
    print("=" * 60)
    print("🧪 Testing Plant Disease Detection Standalone Backend")
    print(f"Target URL: {base_url}")
    print("=" * 60)

    # 1. Health check
    print("\n[TEST 1] Checking Health Endpoint (/health)...")
    try:
        res = requests.get(f"{base_url}/health", timeout=10)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        print(f"✓ Health OK: Status={data.get('status')}, Model={data.get('model_name')}, Device={data.get('device')}, Classes={data.get('num_classes')}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

    # 2. Classes list
    print("\n[TEST 2] Checking Classes Endpoint (/classes)...")
    try:
        res = requests.get(f"{base_url}/classes", timeout=10)
        assert res.status_code == 200
        data = res.json()
        total = data.get("total", 0)
        crops = data.get("crops_covered", [])
        assert total == 38, f"Expected 38 classes, found {total}"
        print(f"✓ Classes OK: {total} total disease classes covering {len(crops)} crops: {crops[:5]}...")
    except Exception as e:
        print(f"❌ Classes endpoint failed: {e}")
        return False

    # 3. Model info
    print("\n[TEST 3] Checking Model Info Endpoint (/model-info)...")
    try:
        res = requests.get(f"{base_url}/model-info", timeout=10)
        assert res.status_code == 200
        data = res.json()
        print(f"✓ Model Info OK: Primary={data.get('primary_model')}, Multimodal={data.get('is_multimodal')}, Shape={data.get('input_shape')}")
    except Exception as e:
        print(f"❌ Model info endpoint failed: {e}")
        return False

    # 4. Predict with authentic dataset sample image
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, ".."))
    sample_tomato = os.path.join(root_dir, "data", "dataset_samples", "Tomato___Early_blight.jpg")

    print(f"\n[TEST 4] Testing Inference with Benchmark Dataset Specimen ({sample_tomato})...")
    if not os.path.exists(sample_tomato):
        print(f"❌ Sample image missing at {sample_tomato}")
        return False

    try:
        with open(sample_tomato, "rb") as f:
            files = {"image": ("Tomato___Early_blight.jpg", f, "image/jpeg")}
            form = {
                "symptoms": "dark concentric rings with chlorotic margin",
                "crop_type": "Tomato"
            }
            res = requests.post(f"{base_url}/predict", files=files, data=form, timeout=30)

        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert data.get("success") is True
        pred = data.get("prediction", {})
        print(f"✓ Diagnosis: {pred.get('disease')}")
        print(f"✓ Detected Crop: {pred.get('crop')}")
        print(f"✓ Confidence: {pred.get('confidence_percent')} (Raw: {pred.get('confidence')})")
        print(f"✓ Severity: {pred.get('severity')}")
        print(f"✓ Is Healthy: {pred.get('is_healthy')}")
        print(f"✓ Top 3: {[c['disease'] + ' (' + c['confidence_percent'] + ')' for c in data.get('top_3', [])]}")
        print(f"✓ Treatment Fungicide: {data.get('treatment', {}).get('fungicide')}")
        print(f"✓ Grad-CAM Heatmap: Present ({len(data.get('grad_cam_image', ''))} characters base64)")
        print(f"✓ Latency: {data.get('processing_time_ms')} ms")
    except Exception as e:
        print(f"❌ Prediction failed: {e}")
        return False

    # 5. History check
    print("\n[TEST 5] Checking History Endpoint (/history)...")
    try:
        res = requests.get(f"{base_url}/history", timeout=10)
        assert res.status_code == 200
        history = res.json()
        print(f"✓ History OK: {len(history)} recorded scans retrieved from local SQLite database.")
        if len(history) > 0:
            print(f"  Latest record: {history[0].get('disease_name')} on {history[0].get('scan_date')}")
    except Exception as e:
        print(f"❌ History endpoint failed: {e}")
        return False

    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED! The Plant Disease Detection Module is fully operational.")
    print("=" * 60)
    return True

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5001"
    success = run_tests(target)
    sys.exit(0 if success else 1)
