// ============================================
// Overlay Manager
// Manages HUD elements and visualizations on camera feed
// ============================================

class OverlayManager {
    constructor() {
        this.overlayCanvas = document.getElementById('overlay');
        this.ctx = this.overlayCanvas.getContext('2d');
        this.video = document.getElementById('webcam');
        
        // HUD elements
        this.emotionDisplay = document.getElementById('emotionDisplay');
        this.confidenceText = document.getElementById('confidenceText');
        this.confidenceFill = document.getElementById('confidenceFill');
        this.postureDisplay = document.getElementById('postureDisplay');
        this.gestureDisplay = document.getElementById('gestureDisplay');
        
        // Stats elements
        this.fpsDisplay = document.getElementById('fpsDisplay');
        this.latencyDisplay = document.getElementById('latencyDisplay');
        this.confDisplay = document.getElementById('confDisplay');
        this.landmarkDisplay = document.getElementById('landmarkDisplay');
        
        // Quality indicators
        this.lightingIndicator = document.getElementById('lightingIndicator');
        this.angleIndicator = document.getElementById('angleIndicator');
        this.warningsDisplay = document.getElementById('warningsDisplay');
        
        // Settings
        this.showLandmarks = true;
        this.showOverlays = true;
        
        // Resize canvas to match video
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.video.getBoundingClientRect();
        this.overlayCanvas.width = rect.width;
        this.overlayCanvas.height = rect.height;
    }

    updateEmotion(emotion, confidence) {
        if (!this.showOverlays) return;
        
        // Update emotion display with animation
        if (this.emotionDisplay.textContent !== emotion) {
            this.emotionDisplay.classList.add('updating');
            setTimeout(() => this.emotionDisplay.classList.remove('updating'), 300);
        }
        
        this.emotionDisplay.textContent = emotion;
        this.emotionDisplay.className = `hud-value emotion emotion-${emotion.toLowerCase()}`;
        
        // Update confidence
        const confPercent = Math.round(confidence * 100);
        this.confidenceText.textContent = `${confPercent}% confidence`;
        this.confidenceFill.style.width = `${confPercent}%`;
        
        // High confidence glow effect
        const hudItem = this.emotionDisplay.closest('.hud-item');
        if (confidence > 0.8) {
            hudItem.classList.add('high-confidence');
        } else {
            hudItem.classList.remove('high-confidence');
        }
    }

    updatePosture(pose) {
        if (!this.showOverlays) return;
        
        // Simplified posture assessment
        const yaw = pose?.yaw || 0;
        const pitch = pose?.pitch || 0;
        
        let postureStatus = 'Good';
        if (Math.abs(yaw) > 25 || Math.abs(pitch) > 20) {
            postureStatus = 'Tilted';
        } else if (Math.abs(yaw) > 15 || Math.abs(pitch) > 15) {
            postureStatus = 'Fair';
        }
        
        this.postureDisplay.textContent = postureStatus;
    }

    updateGesture(landmarks) {
        if (!this.showOverlays || !landmarks) return;
        
        // Simple gesture detection (placeholder)
        // In production, implement actual gesture recognition
        this.gestureDisplay.textContent = 'Monitoring...';
    }

    updateMetrics(metrics) {
        if (!metrics) return;
        
        this.fpsDisplay.textContent = metrics.fps.toFixed(2);
        this.latencyDisplay.textContent = `${Math.round(metrics.latency_ms)}ms`;
        this.confDisplay.textContent = (metrics.confidence || 0).toFixed(2);
        this.landmarkDisplay.textContent = metrics.landmarks_count || 0;
    }

    updateQualityIndicators(warnings) {
        // Lighting indicator
        const hasLightingWarning = warnings.some(w => 
            w.toLowerCase().includes('lighting') || w.toLowerCase().includes('overexposed')
        );
        
        if (hasLightingWarning) {
            this.lightingIndicator.classList.remove('good');
            this.lightingIndicator.classList.add('warning');
        } else {
            this.lightingIndicator.classList.add('good');
            this.lightingIndicator.classList.remove('warning');
        }
        
        // Angle indicator
        const hasAngleWarning = warnings.some(w => 
            w.toLowerCase().includes('turned') || w.toLowerCase().includes('tilted')
        );
        
        if (hasAngleWarning) {
            this.angleIndicator.classList.remove('good');
            this.angleIndicator.classList.add('warning');
        } else {
            this.angleIndicator.classList.add('good');
            this.angleIndicator.classList.remove('warning');
        }
        
        // Display warnings
        if (warnings.length > 0) {
            this.warningsDisplay.innerHTML = warnings.slice(0, 2).join('<br>');
            this.warningsDisplay.classList.add('active');
        } else {
            this.warningsDisplay.classList.remove('active');
        }
    }

    drawLandmarks(landmarks) {
        if (!this.showLandmarks || !landmarks) return;
        
        // Clear previous drawings
        this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        
        const scaleX = this.overlayCanvas.width;
        const scaleY = this.overlayCanvas.height;
        
        // Draw face mesh
        this.ctx.fillStyle = 'rgba(0, 217, 255, 0.6)';
        this.ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        landmarks.forEach((landmark, idx) => {
            const x = landmark.x * scaleX;
            const y = landmark.y * scaleY;
            
            // Draw landmark point
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
            this.ctx.fill();
        });
        
        // Draw face outline (simplified)
        this.drawFaceContour(landmarks, scaleX, scaleY);
    }

    drawFaceContour(landmarks, scaleX, scaleY) {
        if (landmarks.length < 100) return;
        
        // Face oval indices (approximate)
        const faceOvalIndices = [
            10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
            397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
            172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
        ];
        
        this.ctx.beginPath();
        faceOvalIndices.forEach((idx, i) => {
            if (landmarks[idx]) {
                const x = landmarks[idx].x * scaleX;
                const y = landmarks[idx].y * scaleY;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
        });
        this.ctx.closePath();
        this.ctx.stroke();
    }

    clearOverlay() {
        this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    }

    toggleLandmarks() {
        this.showLandmarks = !this.showLandmarks;
        if (!this.showLandmarks) {
            this.clearOverlay();
        }
        return this.showLandmarks;
    }

    toggleOverlays() {
        this.showOverlays = !this.showOverlays;
        const hudElements = document.querySelectorAll('.hud-item');
        hudElements.forEach(el => {
            el.style.opacity = this.showOverlays ? '1' : '0';
        });
        return this.showOverlays;
    }

    updateAll(data) {
        if (!data) return;
        
        // Update emotion
        this.updateEmotion(data.emotion, data.confidence);
        
        // Update posture (if pose data available)
        if (data.pose) {
            this.updatePosture(data.pose);
        }
        
        // Update gesture
        if (data.landmarks) {
            this.updateGesture(data.landmarks);
        }
        
        // Update metrics
        if (data.metrics) {
            this.updateMetrics({
                ...data.metrics,
                confidence: data.confidence
            });
        }
        
        // Update quality indicators
        if (data.warnings) {
            this.updateQualityIndicators(data.warnings);
        }
        
        // Draw landmarks
        if (data.landmarks) {
            this.drawLandmarks(data.landmarks);
        }
    }
}

// Export for use in other modules
window.OverlayManager = OverlayManager;
