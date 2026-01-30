// ============================================
// API Client
// Communication with FastAPI backend
// ============================================

class EmotionAPI {
    constructor(baseURL = 'http://localhost:8000') {
        this.baseURL = baseURL;
        this.isConnected = false;
    }

    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            if (response.ok) {
                this.isConnected = true;
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Health check failed:', error);
            this.isConnected = false;
            return null;
        }
    }

    async detectEmotion(frameData, options = {}) {
        const {
            includeLandmarks = true,
            includeMetrics = true
        } = options;

        try {
            const response = await fetch(`${this.baseURL}/detect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    frame: frameData,
                    include_landmarks: includeLandmarks,
                    include_metrics: includeMetrics
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Detection request failed:', error);
            return null;
        }
    }

    async resetSession() {
        try {
            const response = await fetch(`${this.baseURL}/reset`, {
                method: 'POST'
            });
            return response.ok;
        } catch (error) {
            console.error('Reset failed:', error);
            return false;
        }
    }

    getConnectionStatus() {
        return this.isConnected;
    }
}

// Export for use in other modules
window.EmotionAPI = EmotionAPI;
