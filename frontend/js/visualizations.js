// ============================================
// Visualization Helpers
// Chart.js integration for data visualization
// ============================================

// This is a placeholder for chart visualizations
// In production, integrate Chart.js or similar library

class VisualizationManager {
    constructor() {
        this.charts = {};
        // Initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.initializeCharts();
        } else {
            console.warn('Chart.js not loaded. Charts will not be rendered.');
        }
    }

    initializeCharts() {
        // Emotion Timeline Chart
        const emotionTimelineCanvas = document.getElementById('emotionChart');
        if (emotionTimelineCanvas) {
            this.charts.emotionTimeline = new Chart(emotionTimelineCanvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Confidence',
                        data: [],
                        borderColor: '#00d9ff',
                        backgroundColor: 'rgba(0, 217, 255, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 1
                        }
                    }
                }
            });
        }

        // Stability Chart
        const stabilityCanvas = document.getElementById('stabilityChart');
        if (stabilityCanvas) {
            this.charts.stability = new Chart(stabilityCanvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Emotional Variance',
                        data: [],
                        borderColor: '#0066ff',
                        backgroundColor: 'rgba(0, 102, 255, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Sentiment Distribution Chart
        const sentimentCanvas = document.getElementById('sentimentChart');
        if (sentimentCanvas) {
            this.charts.sentiment = new Chart(sentimentCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['Positive', 'Neutral', 'Negative'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: [
                            '#10b981',
                            '#64748b',
                            '#ef4444'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    updateEmotionTimeline(timestamp, confidence) {
        if (!this.charts.emotionTimeline) return;

        const chart = this.charts.emotionTimeline;
        chart.data.labels.push(new Date(timestamp).toLocaleTimeString());
        chart.data.datasets[0].data.push(confidence);

        // Keep only last 20 points
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update('none'); // Update without animation for performance
    }

    updateSentimentChart(positive, neutral, negative) {
        if (!this.charts.sentiment) return;

        const chart = this.charts.sentiment;
        chart.data.datasets[0].data = [positive, neutral, negative];
        chart.update();
    }
}

// Export for use in other modules
window.VisualizationManager = VisualizationManager;

// Note: To enable charts, include Chart.js in your HTML:
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
