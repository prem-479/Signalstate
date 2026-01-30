// ============================================
// Tab Manager
// Handles tab switching and content updates
// ============================================

class TabManager {
    constructor() {
        this.currentTab = 'live';
        this.tabs = {};
        this.dataBuffer = [];
        this.maxBufferSize = 100;
        
        // Initialize tabs
        this.initializeTabs();
        this.setupEventListeners();
    }

    initializeTabs() {
        // Register all tab handlers
        this.tabs = {
            live: new LiveDemoTab(),
            hci: new HCIResearchTab(),
            learning: new LearningTab(),
            accessibility: new AccessibilityTab(),
            cx: new CXAnalysisTab(),
            explainability: new ExplainabilityTab()
        };
    }

    setupEventListeners() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        if (!this.tabs[tabName]) {
            console.warn(`Tab ${tabName} not found`);
            return;
        }

        // Update active button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update active pane
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `tab-${tabName}`);
        });

        // Notify tab handler
        if (this.tabs[tabName].onActivate) {
            this.tabs[tabName].onActivate();
        }

        this.currentTab = tabName;
    }

    updateData(emotionData) {
        // Add to buffer
        this.dataBuffer.push({
            ...emotionData,
            timestamp: Date.now()
        });

        // Trim buffer
        if (this.dataBuffer.length > this.maxBufferSize) {
            this.dataBuffer.shift();
        }

        // Update current tab
        const currentTabHandler = this.tabs[this.currentTab];
        if (currentTabHandler && currentTabHandler.update) {
            currentTabHandler.update(emotionData, this.dataBuffer);
        }
    }

    resetAllTabs() {
        this.dataBuffer = [];
        Object.values(this.tabs).forEach(tab => {
            if (tab.reset) tab.reset();
        });
    }
}

// ============================================
// Individual Tab Handlers
// ============================================

class LiveDemoTab {
    constructor() {
        this.probabilityBars = document.getElementById('probabilityBars');
        this.setupProbabilityBars();
    }

    setupProbabilityBars() {
        const emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'];
        this.probabilityBars.innerHTML = emotions.map(emotion => `
            <div class="prob-bar-item">
                <span class="prob-label">${emotion}</span>
                <div class="prob-bar-container">
                    <div class="prob-bar-fill" id="prob-${emotion.toLowerCase()}"></div>
                </div>
                <span class="prob-value" id="val-${emotion.toLowerCase()}">0%</span>
            </div>
        `).join('');
    }

    update(data) {
        if (!data || !data.probabilities) return;

        // Update probability bars
        Object.entries(data.probabilities).forEach(([emotion, prob]) => {
            const fill = document.getElementById(`prob-${emotion.toLowerCase()}`);
            const value = document.getElementById(`val-${emotion.toLowerCase()}`);
            
            if (fill && value) {
                fill.style.width = `${prob * 100}%`;
                value.textContent = `${(prob * 100).toFixed(1)}%`;
            }
        });
    }

    reset() {
        // Reset all bars to 0
        document.querySelectorAll('.prob-bar-fill').forEach(bar => {
            bar.style.width = '0%';
        });
        document.querySelectorAll('.prob-value').forEach(val => {
            val.textContent = '0%';
        });
    }
}

class HCIResearchTab {
    constructor() {
        this.engagementFill = document.getElementById('engagementFill');
        this.engagementValue = document.getElementById('engagementValue');
        this.sessionDuration = document.getElementById('sessionDuration');
        this.emotionSwitches = document.getElementById('emotionSwitches');
        this.avgConfidence = document.getElementById('avgConfidence');
        
        this.sessionStart = Date.now();
        this.lastEmotion = null;
        this.emotionChangeCount = 0;
        this.confidenceSum = 0;
        this.sampleCount = 0;
    }

    update(data, buffer) {
        if (!data) return;

        // Calculate engagement based on emotion variety
        const engagementScore = this.calculateEngagement(buffer);
        this.engagementFill.style.width = `${engagementScore}%`;
        this.engagementValue.textContent = `${Math.round(engagementScore)}%`;

        // Update session duration
        const duration = Math.floor((Date.now() - this.sessionStart) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        this.sessionDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Track emotion changes
        if (this.lastEmotion && this.lastEmotion !== data.emotion) {
            this.emotionChangeCount++;
            this.emotionSwitches.textContent = this.emotionChangeCount;
        }
        this.lastEmotion = data.emotion;

        // Average confidence
        this.confidenceSum += data.confidence;
        this.sampleCount++;
        const avgConf = (this.confidenceSum / this.sampleCount) * 100;
        this.avgConfidence.textContent = `${Math.round(avgConf)}%`;
    }

    calculateEngagement(buffer) {
        if (buffer.length < 5) return 50;

        // Simple engagement metric: variety of emotions
        const recentEmotions = buffer.slice(-30).map(d => d.emotion);
        const uniqueEmotions = new Set(recentEmotions).size;
        const avgConfidence = buffer.slice(-30).reduce((sum, d) => sum + d.confidence, 0) / Math.min(30, buffer.length);

        return Math.min(100, (uniqueEmotions * 15) + (avgConfidence * 40));
    }

    reset() {
        this.sessionStart = Date.now();
        this.emotionChangeCount = 0;
        this.confidenceSum = 0;
        this.sampleCount = 0;
        this.lastEmotion = null;
        
        this.engagementFill.style.width = '0%';
        this.engagementValue.textContent = '0%';
        this.emotionSwitches.textContent = '0';
        this.avgConfidence.textContent = '0%';
    }
}

class LearningTab {
    constructor() {
        this.attentionLabel = document.getElementById('attentionLabel');
        this.engagedFill = document.getElementById('engagedFill');
        this.neutralFill = document.getElementById('neutralFill');
        this.distractedFill = document.getElementById('distractedFill');
        this.engagedPercent = document.getElementById('engagedPercent');
        this.neutralPercent = document.getElementById('neutralPercent');
        this.distractedPercent = document.getElementById('distractedPercent');
        
        this.attentionStates = { engaged: 0, neutral: 0, distracted: 0 };
    }

    update(data) {
        if (!data) return;

        // Map emotions to attention states (simplified)
        const attentionMap = {
            'Happy': 'engaged',
            'Surprise': 'engaged',
            'Neutral': 'neutral',
            'Sad': 'distracted',
            'Angry': 'distracted',
            'Fear': 'distracted',
            'Disgust': 'distracted'
        };

        const state = attentionMap[data.emotion] || 'neutral';
        this.attentionStates[state]++;

        // Calculate percentages
        const total = Object.values(this.attentionStates).reduce((a, b) => a + b, 0);
        const engaged = (this.attentionStates.engaged / total) * 100;
        const neutral = (this.attentionStates.neutral / total) * 100;
        const distracted = (this.attentionStates.distracted / total) * 100;

        // Update UI
        this.engagedFill.style.width = `${engaged}%`;
        this.neutralFill.style.width = `${neutral}%`;
        this.distractedFill.style.width = `${distracted}%`;
        
        this.engagedPercent.textContent = `${Math.round(engaged)}%`;
        this.neutralPercent.textContent = `${Math.round(neutral)}%`;
        this.distractedPercent.textContent = `${Math.round(distracted)}%`;

        // Update label
        if (engaged > 60) {
            this.attentionLabel.textContent = 'Highly Engaged';
        } else if (distracted > 50) {
            this.attentionLabel.textContent = 'Attention Wandering';
        } else {
            this.attentionLabel.textContent = 'Neutral Focus';
        }
    }

    reset() {
        this.attentionStates = { engaged: 0, neutral: 0, distracted: 0 };
    }
}

class AccessibilityTab {
    constructor() {
        this.adaptiveBox = document.getElementById('adaptiveBox');
        this.highContrastToggle = document.getElementById('highContrastToggle');
        this.largeTextToggle = document.getElementById('largeTextToggle');
        this.disableAdaptiveToggle = document.getElementById('disableAdaptiveToggle');
    }

    update(data) {
        if (!data || !this.disableAdaptiveToggle.checked) return;

        // Adapt UI based on emotion
        const stressEmotions = ['Angry', 'Fear', 'Sad'];
        if (stressEmotions.includes(data.emotion) && data.confidence > 0.7) {
            this.adaptiveBox.classList.add('stress-mode');
        } else {
            this.adaptiveBox.classList.remove('stress-mode');
        }
    }
}

class CXAnalysisTab {
    constructor() {
        this.positiveMoments = document.getElementById('positiveMoments');
        this.neutralMoments = document.getElementById('neutralMoments');
        this.negativeMoments = document.getElementById('negativeMoments');
        
        this.counts = { positive: 0, neutral: 0, negative: 0 };
    }

    update(data) {
        if (!data) return;

        // Categorize emotion
        const sentimentMap = {
            'Happy': 'positive',
            'Surprise': 'positive',
            'Neutral': 'neutral',
            'Sad': 'negative',
            'Angry': 'negative',
            'Fear': 'negative',
            'Disgust': 'negative'
        };

        const sentiment = sentimentMap[data.emotion] || 'neutral';
        this.counts[sentiment]++;

        // Update counts
        this.positiveMoments.textContent = this.counts.positive;
        this.neutralMoments.textContent = this.counts.neutral;
        this.negativeMoments.textContent = this.counts.negative;
    }

    reset() {
        this.counts = { positive: 0, neutral: 0, negative: 0 };
    }
}

class ExplainabilityTab {
    constructor() {
        this.probabilityTable = document.getElementById('probabilityTable');
    }

    update(data) {
        if (!data || !data.probabilities) return;

        // Create sortable table of probabilities
        const sorted = Object.entries(data.probabilities)
            .sort(([, a], [, b]) => b - a);

        this.probabilityTable.innerHTML = `
            <table style="width: 100%; font-size: 0.85rem;">
                <thead>
                    <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 0.5rem;">Rank</th>
                        <th style="padding: 0.5rem;">Emotion</th>
                        <th style="padding: 0.5rem;">Probability</th>
                        <th style="padding: 0.5rem;">Confidence</th>
                    </tr>
                </thead>
                <tbody>
                    ${sorted.map(([emotion, prob], idx) => `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 0.5rem;">${idx + 1}</td>
                            <td style="padding: 0.5rem;">${emotion}</td>
                            <td style="padding: 0.5rem;">${prob.toFixed(4)}</td>
                            <td style="padding: 0.5rem;">
                                <div style="width: ${prob * 100}%; height: 4px; background: var(--accent-cyan); border-radius: 2px;"></div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}

// Export for use in other modules
window.TabManager = TabManager;
