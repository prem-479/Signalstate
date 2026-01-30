// ============================================
// Main Application Controller
// Orchestrates all components
// ============================================

class EmotionAIApp {
    constructor() {
        // Initialize components
        this.camera = new CameraHandler();
        this.api = new EmotionAPI('http://localhost:8000');
        this.overlay = new OverlayManager();
        this.tabs = new TabManager();

        // State
        this.isRunning = false;
        this.processingFrame = false;

        // UI elements
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.consentModal = document.getElementById('consentModal');
        this.privacyBanner = document.getElementById('privacyBanner');
        this.loaderOverlay = document.getElementById('loaderOverlay');

        // Controls
        this.toggleCameraBtn = document.getElementById('toggleCamera');
        this.toggleLandmarksBtn = document.getElementById('toggleLandmarks');
        this.toggleOverlaysBtn = document.getElementById('toggleOverlays');

        // Setup
        this.setupEventListeners();
        this.checkBackendConnection();
    }

    setupEventListeners() {
        // Privacy banner
        document.getElementById('acceptPrivacy').addEventListener('click', () => {
            this.privacyBanner.style.display = 'none';
        });

        // Consent modal
        document.getElementById('acceptConsent').addEventListener('click', () => {
            this.handleConsentAccept();
        });

        document.getElementById('declineConsent').addEventListener('click', () => {
            this.consentModal.classList.add('hidden');
            this.updateStatus('Camera access denied', false);
        });

        // Camera controls
        this.toggleCameraBtn.addEventListener('click', () => {
            this.toggleCamera();
        });

        this.toggleLandmarksBtn.addEventListener('click', () => {
            const enabled = this.overlay.toggleLandmarks();
            this.toggleLandmarksBtn.classList.toggle('active', enabled);
        });

        this.toggleOverlaysBtn.addEventListener('click', () => {
            const enabled = this.overlay.toggleOverlays();
            this.toggleOverlaysBtn.classList.toggle('active', enabled);
        });

        // Camera frame callback
        this.camera.onFrame = (frameData) => {
            this.processFrame(frameData);
        };
    }

    async checkBackendConnection() {
        this.updateStatus('Connecting to AI backend...', false);

        const health = await this.api.checkHealth();

        if (health) {
            this.updateStatus('Backend connected', true);
            console.log('Backend health:', health);
        } else {
            this.updateStatus('Backend offline - Using demo mode', false);
            console.warn('Could not connect to backend. Make sure it\'s running on http://localhost:8000');
        }
    }

    updateStatus(message, isActive) {
        this.statusText.textContent = message;
        this.statusDot.classList.toggle('active', isActive);
    }

    async handleConsentAccept() {
        this.consentModal.classList.add('hidden');
        this.updateStatus('Requesting camera access...', false);

        const granted = await this.camera.requestPermission();

        if (granted) {
            this.updateStatus('Camera ready', true);
            this.startCamera();
        } else {
            this.updateStatus('Camera access denied', false);
            alert('Camera access is required for this demo. Please grant permission and reload.');
        }
    }

    startCamera() {
        const started = this.camera.start();

        if (started) {
            this.isRunning = true;
            this.toggleCameraBtn.classList.add('active');
            this.updateStatus('Processing...', true);
        } else {
            this.updateStatus('Failed to start camera', false);
        }
    }

    stopCamera() {
        this.camera.stop();
        this.isRunning = false;
        this.toggleCameraBtn.classList.remove('active');
        this.overlay.clearOverlay();
        this.updateStatus('Camera stopped', false);
    }

    toggleCamera() {
        if (this.isRunning) {
            this.stopCamera();
        } else {
            if (!this.camera.stream) {
                // Need to request permission first
                this.consentModal.classList.remove('hidden');
            } else {
                this.startCamera();
            }
        }
    }

    async processFrame(frameData) {
        if (this.processingFrame || !this.isRunning) return;

        this.processingFrame = true;

        try {
            const result = await this.api.detectEmotion(frameData, {
                includeLandmarks: true,
                includeMetrics: true
            });

            if (result) {
                // Update overlay
                this.overlay.updateAll(result);

                // Update tabs
                this.tabs.updateData(result);

                // Update status
                this.updateStatus(`Detecting: ${result.emotion}`, true);
            } else {
                // Fallback to demo mode if backend unavailable
                this.handleDemoMode();
            }
        } catch (error) {
            console.error('Frame processing error:', error);
        } finally {
            this.processingFrame = false;
        }
    }

    handleDemoMode() {
        // Generate mock data when backend is unavailable
        const mockEmotions = ['Happy', 'Neutral', 'Surprise'];
        const mockEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];

        const mockData = {
            emotion: mockEmotion,
            confidence: 0.7 + Math.random() * 0.25,
            probabilities: {
                'Happy': Math.random() * 0.3,
                'Sad': Math.random() * 0.2,
                'Angry': Math.random() * 0.1,
                'Surprise': Math.random() * 0.2,
                'Fear': Math.random() * 0.1,
                'Disgust': Math.random() * 0.05,
                'Neutral': Math.random() * 0.25
            },
            warnings: [],
            metrics: {
                fps: 12 + Math.random() * 3,
                latency_ms: 80 + Math.random() * 40,
                face_detected: true,
                landmarks_count: 468
            }
        };

        // Normalize probabilities
        const sum = Object.values(mockData.probabilities).reduce((a, b) => a + b, 0);
        Object.keys(mockData.probabilities).forEach(key => {
            mockData.probabilities[key] /= sum;
        });

        this.overlay.updateAll(mockData);
        this.tabs.updateData(mockData);
        this.updateStatus('Demo Mode (Backend Offline)', false);
    }

    async reset() {
        await this.api.resetSession();
        this.tabs.resetAllTabs();
        console.log('Session reset');
    }

    hideLoader() {
        if (this.loaderOverlay) {
            this.loaderOverlay.classList.add('hidden');
        }
    }

    showLoader() {
        if (this.loaderOverlay) {
            this.loaderOverlay.classList.remove('hidden');
        }
    }
}

// ============================================
// Application Initialization
// ============================================

let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Signalstate...');
    app = new EmotionAIApp();

    // Make app globally accessible for debugging
    window.emotionApp = app;

    // Cinematic delay for loader
    setTimeout(() => {
        app.hideLoader();
        console.log('Application initialized. Click "Grant Camera Access" to begin.');
    }, 1500);
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (app && app.isRunning) {
        app.stopCamera();
    }
});
