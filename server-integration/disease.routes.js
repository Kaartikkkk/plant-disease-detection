const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// In-memory multer storage
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload a JPG, PNG, or WEBP image.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const FLASK_URL = process.env.FLASK_AI_URL || process.env.AI_SERVER_URL || 'http://localhost:5001';

/**
 * @route   POST /predict
 * @desc    Forward image + symptoms to Python Flask ML service
 */
router.post('/predict', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const symptoms = req.body.symptoms || '';
    const cropType = req.body.crop_type || req.body.cropType || '';
    const farmId = req.body.farmId || req.body.farm_id || '';

    const form = new FormData();
    form.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });
    form.append('symptoms', symptoms);
    form.append('crop_type', cropType);
    if (farmId) form.append('farmId', farmId);

    const response = await axios.post(`${FLASK_URL}/predict`, form, {
      headers: { ...form.getHeaders() },
      timeout: 35000
    });

    return res.status(200).json(response.data);
  } catch (err) {
    console.error('Plant Disease Prediction Proxy Error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI microservice unreachable. Ensure Flask is running on port 5001.' });
    }
    return res.status(500).json({ error: 'Prediction failed', details: err.message });
  }
});

/**
 * @route   GET /health
 * @desc    Check Flask AI service health
 */
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_URL}/health`, { timeout: 4000 });
    return res.status(200).json({ online: true, ...response.data });
  } catch (e) {
    return res.status(200).json({ online: false, error: 'AI service offline or loading weights.' });
  }
});

/**
 * @route   GET /classes
 * @desc    Retrieve 38 supported disease classes
 */
router.get('/classes', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_URL}/classes`, { timeout: 4000 });
    return res.status(200).json(response.data);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to retrieve classes', details: e.message });
  }
});

/**
 * @route   GET /history
 * @desc    Retrieve scan history from backend service
 */
router.get('/history', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_URL}/history`, { timeout: 4000 });
    return res.status(200).json(response.data);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to retrieve history', details: e.message });
  }
});

module.exports = router;
