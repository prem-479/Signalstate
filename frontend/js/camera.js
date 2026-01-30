// ============================================
// Camera Handler
// Webcam access, frame capture, and streaming
// ============================================

class CameraHandler {
    constructor() {
        this.video = document.getElementById('webcam');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stream = null;
        this.isStreaming = false;
        this.captureInterval = null;
        this.frameRate = 10; // Target FPS
        
        // Event callbacks
        this.onFrame = null;
    }

    async requestPermission() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            return false;
        }
    }

    start() {
        if (!this.stream) {
            console.error('No stream available. Request permission first.');
            return false;
        }

        this.video.srcObject = this.stream;
        this.isStreaming = true;

        // Wait for video to be ready
        this.video.addEventListener('loadedmetadata', () => {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            this.startCapture();
        });

        return true;
    }

    stop() {
        this.isStreaming = false;
        
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.video.srcObject = null;
    }

    startCapture() {
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
        }

        const intervalMs = 1000 / this.frameRate;

        this.captureInterval = setInterval(() => {
            if (this.isStreaming && this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                const frame = this.captureFrame();
                if (this.onFrame && frame) {
                    this.onFrame(frame);
                }
            }
        }, intervalMs);
    }

    captureFrame() {
        if (!this.isStreaming || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
            return null;
        }

        // Draw current video frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Convert to base64
        const frameData = this.canvas.toDataURL('image/jpeg', 0.8);
        return frameData;
    }

    setFrameRate(fps) {
        this.frameRate = Math.max(1, Math.min(30, fps)); // Clamp between 1-30 FPS
        if (this.isStreaming) {
            this.startCapture(); // Restart with new rate
        }
    }

    getVideoElement() {
        return this.video;
    }

    isActive() {
        return this.isStreaming;
    }
}

// Export for use in other modules
window.CameraHandler = CameraHandler;
