# Signalstate - Professional Architecture

## Project Structure

```
signalstate/
├── backend/
│   ├── app.py                 # FastAPI server
│   ├── models/
│   │   ├── emotion_model.py   # TensorFlow emotion classifier
│   │   └── face_processor.py  # MediaPipe + OpenCV pipeline
│   ├── utils/
│   │   ├── validators.py      # Input validation
│   │   └── metrics.py         # Performance tracking
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── main.css
│   │   ├── camera-overlay.css
│   │   └── tabs.css
│   ├── js/
│   │   ├── camera.js          # Webcam handling
│   │   ├── api.js             # Backend communication
│   │   ├── overlays.js        # Live feed overlays
│   │   ├── tabs.js            # Tab switching
│   │   └── visualizations.js  # Charts & graphs
│   └── assets/
│       └── fonts/
│
└── docs/
    ├── PRIVACY.md
    ├── ETHICS.md
    └── TECHNICAL.md
```

## Technical Stack

### Backend
- **FastAPI** (Python 3.10+)
- **TensorFlow 2.x** (Emotion classification)
- **MediaPipe** (Face landmarks)
- **OpenCV** (Frame preprocessing)
- **NumPy** (Numerical operations)

### Frontend
- **Vanilla JavaScript** (ES6+)
- **CSS Grid & Flexbox**
- **Canvas API** (Overlays)
- **WebRTC** (Camera access)

## System Architecture

### Data Flow Pipeline

1. **Client**: Webcam → Canvas → Base64 encoding → HTTPS
2. **Server**: Decode → OpenCV preprocessing → MediaPipe landmarks → TensorFlow inference
3. **Processing**: Temporal smoothing → Confidence thresholding → State aggregation
4. **Response**: JSON with emotion, confidence, landmarks, metrics
5. **Client**: Update overlays, visualizations, and tab-specific UI

### Performance Targets
- **Latency**: < 150ms end-to-end
- **FPS**: 10-15 (adjustable)
- **Frame size**: 640x480 (optimized)
- **Model inference**: < 50ms

## Core Features Implementation

### 1. Live Camera Overlay System
```
┌─────────────────────────────────────┐
│  CURRENT MOOD    POSTURE CHECK     │
│     Happy          Good            │
│                                    │
│  [  Live Camera Feed with Face  ]  │
│  [  Landmark Points Overlay     ]  │
│                                    │
│  GESTURE          AI STATS         │
│  Thumbs Up!       FPS: 12.5       │
│                   Latency: 98ms    │
│                   Confidence: 0.87 │
└─────────────────────────────────────┘
```

### 2. Tab-Based Interpretations
All tabs use the same AI pipeline but present different interpretations:

- **Live Demo**: Raw emotions, confidence, technical metrics
- **HCI Research**: Engagement tracking, emotional stability
- **Learning Mode**: Attention monitoring, session analytics
- **Accessibility**: Adaptive UI based on emotional state
- **CX Analysis**: Experience mapping, sentiment distribution
- **Explainability**: Model internals, heatmaps, probabilities

### 3. Ethical Guardrails
- No storage, no database
- Session-only processing
- Explicit consent flow
- Clear limitation messaging
- Privacy-first architecture

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] FastAPI backend setup
- [ ] MediaPipe + TensorFlow pipeline
- [ ] Basic emotion classification
- [ ] Camera feed handling

### Phase 2: Live Overlay System
- [ ] Real-time metrics display
- [ ] Face landmark visualization
- [ ] Performance monitoring (FPS, latency)
- [ ] Gesture detection overlay

### Phase 3: Tab System
- [ ] Tab architecture
- [ ] Live Demo tab
- [ ] HCI Research tab
- [ ] Learning Mode tab

### Phase 4: Advanced Features
- [ ] Temporal smoothing
- [ ] Confidence thresholding
- [ ] Attention heatmaps
- [ ] Model comparison mode

### Phase 5: Polish & Ethics
- [ ] Professional UI design
- [ ] Privacy documentation
- [ ] Ethics guidelines
- [ ] Technical documentation

## Design Philosophy

### Visual Identity
- **Tone**: Research instrument meets editorial design
- **Typography**: IBM Plex Mono (metrics) + Space Grotesk (headings)
- **Color**: Deep blue primary, cyan accent, dark mode first
- **Layout**: Information density with clarity
- **Animation**: Purposeful, data-driven transitions

### Overlay Design Principles
1. **Non-intrusive**: Metrics float, don't obscure
2. **High contrast**: Readable in various lighting
3. **Contextual**: Show what matters for each mode
4. **Professional**: Technical accuracy over decoration

## Next Steps

1. Set up development environment
2. Build backend inference pipeline
3. Create camera overlay system
4. Implement tab architecture
5. Add visualizations and metrics
6. Polish and document
