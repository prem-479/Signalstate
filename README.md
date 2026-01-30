# Signalstate

A professional, research-grade emotion detection demonstration system featuring real-time facial expression analysis with live camera overlays, multiple application contexts, and privacy-first architecture.

##  Project Overview

This is a **portfolio demonstration**, not a commercial product. It showcases:

- Real-time emotion detection using TensorFlow and MediaPipe
- Professional HUD-style camera overlays (inspired by modern AI interfaces)
- Multi-context interpretation (HCI, Learning, CX, Accessibility)
- Privacy-first, session-only processing
- Research-grade architecture and documentation

##  Key Features

### Live Camera Overlay System
- Real-time emotion display with confidence scores
- FPS and latency metrics
- Posture and angle quality indicators
- Gesture detection overlay
- Face landmark visualization

### Tab-Based Application Modes
1. **Live Demo** - Raw emotion detection with technical metrics
2. **HCI Research** - Engagement tracking and emotional stability
3. **Learning Mode** - Attention monitoring (educational interpretation only)
4. **Accessibility** - Emotion-adaptive UI demonstration
5. **CX Analysis** - Customer experience sentiment mapping
6. **Explainability Lab** - Model internals and limitations

### Technical Highlights
- FastAPI backend with MediaPipe + TensorFlow pipeline
- Vanilla JavaScript frontend (no heavy frameworks)
- Temporal smoothing for stable predictions
- Comprehensive quality warnings and validation
- Professional, non-generic UI design

##  Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  FastAPI     │────▶│ TensorFlow  │
│  (Webcam)   │     │  Backend     │     │   Model     │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     │
       │                    │                     │
       ▼                    ▼                     ▼
 Canvas Overlay      MediaPipe          Emotion Output
   Live HUD         Face Mesh          7 Emotions
```

##  Prerequisites

### Backend Requirements
- Python 3.10+
- pip
- Webcam access

### Frontend Requirements
- Modern web browser (Chrome/Firefox recommended)
- HTTPS or localhost (required for webcam access)

##  Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd signalstate
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

Server runs on `http://localhost:8000`

### 3. Setup Frontend

```bash
cd frontend

# Serve with any HTTP server
# Option 1: Python
python -m http.server 8080

# Option 2: Node.js
npx http-server -p 8080

# Option 3: VS Code Live Server extension
```

Frontend runs on `http://localhost:8080`

### 4. Open Application

1. Navigate to `http://localhost:8080`
2. Accept privacy notice
3. Grant camera permissions
4. Start detection!

##  UI Design Philosophy

- **Research Instrument Aesthetic**: Professional, intentional, non-generic
- **Typography**: IBM Plex Mono (metrics) + Space Grotesk (headings)
- **Color System**: Deep blue primary, cyan accents, dark-first
- **Information Density**: Clear hierarchy with technical accuracy
- **Motion**: Purposeful, data-driven animations

##  Technical Specifications

### Backend Performance
- **Latency**: < 150ms end-to-end
- **FPS**: 10-15 (configurable)
- **Frame size**: 640x480
- **Model inference**: < 50ms

### Emotion Labels
- Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral
- Based on FER2013 dataset categories

### Features
- Temporal smoothing (5-frame window)
- Confidence thresholding
- Head pose estimation
- Quality assessment (lighting, angle, occlusion)

##  Privacy & Ethics

### Core Principles
-  No data storage
-  No database
-  No identity recognition
-  No medical/diagnostic claims
-  Session-only processing
-  Explicit consent required
-  Clear limitations messaging

### Data Handling
- All processing is in-memory
- Frames are never saved
- No persistent storage
- User-initiated camera access

##  Development

### Project Structure
```
signalstate/
├── backend/
│   ├── app.py                 # FastAPI server
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── main.css
│   │   ├── camera-overlay.css
│   │   └── tabs.css
│   └── js/
│       ├── app.js
│       ├── camera.js
│       ├── api.js
│       ├── overlays.js
│       ├── tabs.js
│       └── visualizations.js
└── docs/
```

### API Endpoints

#### `GET /health`
Health check and performance metrics

#### `POST /detect`
Main emotion detection endpoint
```json
{
  "frame": "base64_encoded_image",
  "include_landmarks": true,
  "include_metrics": true
}
```

Returns:
```json
{
  "emotion": "Happy",
  "confidence": 0.87,
  "probabilities": {...},
  "landmarks": [...],
  "metrics": {...},
  "warnings": [...]
}
```

#### `POST /reset`
Reset temporal smoothing and session state

##  Configuration

### Adjust Frame Rate
```javascript
// In frontend/js/camera.js
this.frameRate = 15; // FPS (1-30)
```

### Adjust Smoothing Window
```python
# In backend/app.py
smoother = TemporalSmoother(window_size=5)
```

##  Use Cases

### For Recruiters
- Demonstrates full-stack ML engineering
- Shows architectural maturity
- Privacy-first design thinking
- Professional UI/UX implementation

### For Researchers
- Explainable AI demonstration
- Multiple application contexts
- Clear limitation documentation
- Reproducible architecture

### For Developers
- Clean code structure
- Modern web technologies
- Modular design patterns
- Comprehensive documentation

##  Limitations

- Trained on FER2013 dataset (grayscale, controlled conditions)
- May not generalize across all demographics equally
- Cannot detect micro-expressions or deliberate masking
- Accuracy decreases with poor lighting or extreme angles
- Confusion possible between similar emotions (e.g., fear/surprise)

##  Additional Documentation

- `docs/PRIVACY.md` - Privacy policy and data handling
- `docs/ETHICS.md` - Ethical considerations and responsible use
- `docs/TECHNICAL.md` - Technical deep dive and API reference

##  Contributing

This is a portfolio project. Feel free to fork and adapt for your own use, but please:
- Maintain privacy-first principles
- Keep ethical disclaimers
- Attribute appropriately

##  License

[Your chosen license here]

##  Acknowledgments

- **MediaPipe** - Face landmark detection
- **TensorFlow** - Emotion classification
- **FastAPI** - Backend framework
- **FER2013** - Training dataset reference

---

##  Disclaimer

**This system is for demonstration purposes only.**

- Not for medical, diagnostic, or clinical use
- Not for surveillance or monitoring without explicit consent
- Not a replacement for human judgment
- Emotion detection is probabilistic and interpretative
- Should be used with caution and awareness of limitations

---

Built with  for technical demonstration and portfolio showcase.
