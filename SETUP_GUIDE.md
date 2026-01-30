# Setup & Deployment Guide

Complete guide for setting up the Signalstate system locally and in production.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Backend Configuration](#backend-configuration)
3. [Frontend Configuration](#frontend-configuration)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### System Requirements

**Minimum:**
- CPU: Dual-core processor
- RAM: 4GB
- Webcam: 720p
- OS: Windows 10+, macOS 10.14+, or Linux

**Recommended:**
- CPU: Quad-core processor
- RAM: 8GB
- Webcam: 1080p
- OS: Latest version

### Step 1: Clone and Navigate

```bash
git clone <your-repo-url>
cd signalstate
```

### Step 2: Backend Setup

#### Install Python Dependencies

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

#### Verify Installation

```bash
python -c "import cv2, mediapipe, fastapi; print('Dependencies installed successfully')"
```

#### Run Backend Server

```bash
# Development mode
python app.py

# Production mode (with uvicorn)
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 2
```

**Expected output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Frontend Setup

#### Serve Frontend Files

**Option 1: Python HTTP Server**
```bash
cd frontend
python -m http.server 8080
```

**Option 2: Node.js HTTP Server**
```bash
cd frontend
npx http-server -p 8080 --cors
```

**Option 3: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Step 4: Access Application

1. Open browser to `http://localhost:8080`
2. Accept privacy notice
3. Click "Grant Camera Access"
4. Start detecting!

---

## Backend Configuration

### Environment Variables

Create `.env` file in `backend/`:

```bash
# Server Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=2

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:8080,http://localhost:3000

# Model Configuration
MODEL_PATH=./models/emotion_model.h5
CONFIDENCE_THRESHOLD=0.5

# Performance Tuning
MAX_FACE_COUNT=1
DETECTION_CONFIDENCE=0.5
TRACKING_CONFIDENCE=0.5
```

### Using TensorFlow Model

To replace the mock emotion detector with an actual model:

1. **Obtain or train a model:**
```python
# Example: Load pre-trained model
import tensorflow as tf
model = tf.keras.models.load_model('path/to/model.h5')
```

2. **Update `app.py`:**
```python
# Replace mock detect_emotion function
def detect_emotion(face_roi):
    # Preprocess
    face_resized = cv2.resize(face_roi, (48, 48))
    face_gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
    face_normalized = face_gray / 255.0
    face_reshaped = face_normalized.reshape(1, 48, 48, 1)
    
    # Predict
    predictions = model.predict(face_reshaped, verbose=0)
    return predictions[0]
```

### Performance Tuning

**Adjust frame processing rate:**
```python
# In frontend/js/camera.js
this.frameRate = 15; // Increase for faster updates
```

**Adjust smoothing window:**
```python
# In backend/app.py
smoother = TemporalSmoother(window_size=7) # Increase for more stability
```

---

## Frontend Configuration

### API Endpoint Configuration

Update API endpoint in `frontend/js/api.js`:

```javascript
// For local development
const api = new EmotionAPI('http://localhost:8000');

// For production
const api = new EmotionAPI('https://your-domain.com/api');
```

### Camera Settings

Adjust camera constraints in `frontend/js/camera.js`:

```javascript
const constraints = {
    video: {
        width: { ideal: 1280 },  // Change resolution
        height: { ideal: 720 },
        facingMode: 'user',      // or 'environment' for rear camera
        frameRate: { ideal: 30 } // Higher frame rate
    }
};
```

### UI Customization

**Change color theme in `frontend/css/main.css`:**
```css
:root {
    --primary-bg: #0a0e1a;      /* Dark background */
    --accent-cyan: #00d9ff;     /* Primary accent */
    --accent-blue: #0066ff;     /* Secondary accent */
    /* ... */
}
```

---

## Production Deployment

### Backend Deployment

#### Using Docker

**Dockerfile:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and run:**
```bash
docker build -t emotion-ai-backend .
docker run -p 8000:8000 emotion-ai-backend
```

#### Using Cloud Platforms

**Heroku:**
```bash
# Create Procfile
echo "web: uvicorn app:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
heroku create emotion-ai-backend
git push heroku main
```

**Google Cloud Run:**
```bash
gcloud run deploy emotion-ai-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

**AWS Lambda + API Gateway:**
Use `mangum` adapter:
```python
from mangum import Mangum
handler = Mangum(app)
```

### Frontend Deployment

#### Static Hosting Options

**1. Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

**2. Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**3. GitHub Pages:**
```bash
# Build and deploy
cd frontend
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

**4. AWS S3 + CloudFront:**
```bash
# Upload to S3
aws s3 sync ./frontend s3://your-bucket-name

# Configure CloudFront distribution
# Enable HTTPS
# Set custom domain
```

### HTTPS Requirements

⚠️ **Webcam access requires HTTPS in production!**

**Options:**
1. Use platform-provided HTTPS (Netlify, Vercel, etc.)
2. Use Cloudflare for free SSL
3. Use Let's Encrypt with nginx/Apache
4. Use AWS Certificate Manager with CloudFront

### CORS Configuration

Update backend CORS settings for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "https://www.your-frontend-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Troubleshooting

### Backend Issues

**Issue: "Module not found" errors**
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Issue: "Address already in use"**
```bash
# Solution: Kill process on port 8000
# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Issue: High latency / slow processing**
```python
# Solution 1: Reduce frame resolution
# In frontend/js/camera.js, lower resolution

# Solution 2: Use CPU-optimized TensorFlow
pip uninstall tensorflow
pip install tensorflow-cpu

# Solution 3: Increase workers
uvicorn app:app --workers 4
```

### Frontend Issues

**Issue: Camera not accessing**
- Ensure HTTPS (or localhost)
- Check browser permissions
- Try different browser
- Verify camera not in use by another app

**Issue: "Backend offline" message**
- Verify backend is running (`http://localhost:8000/health`)
- Check CORS settings
- Verify API endpoint in `api.js`

**Issue: Black screen / no video**
```javascript
// Check browser console for errors
// Verify video constraints are supported
// Try lowering resolution
```

**Issue: Overlays not displaying**
```javascript
// Verify canvas element exists
// Check CSS display properties
// Ensure overlay.js is loaded
```

### Performance Optimization

**Reduce latency:**
1. Lower camera resolution (640x480 instead of 1280x720)
2. Reduce frame rate (10 FPS instead of 15)
3. Increase smoothing window (more stable, less reactive)
4. Use dedicated GPU if available

**Improve stability:**
1. Increase temporal smoothing window
2. Add confidence thresholding
3. Implement debouncing for emotion changes

### Browser Compatibility

**Supported:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Not supported:**
- Internet Explorer ❌
- Mobile browsers (limited) ⚠️

### Debug Mode

Enable detailed logging:

**Backend:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend:**
```javascript
// In app.js, add
window.DEBUG = true;
```

---

## Production Checklist

Before deploying:

- [ ] Backend uses production-grade model (not mock)
- [ ] HTTPS enabled for frontend
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Error handling implemented
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Privacy policy accessible
- [ ] Disclaimer displayed
- [ ] Performance tested
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness checked

---

## Support

For issues or questions:
1. Check this documentation
2. Review GitHub issues
3. Check browser console for errors
4. Verify backend logs

---

**Last Updated:** January 2026
