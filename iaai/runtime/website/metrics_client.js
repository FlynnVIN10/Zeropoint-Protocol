/**
 * Live Metrics Client - Phase W Task 2
 * Real-time SSE client for website metrics display
 * MOCKS_DISABLED=1 enforced - no placeholders or fabricated data
 */

class LiveMetricsClient {
    constructor() {
        this.eventSource = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.metricsData = {};
        
        // Chart instances
        this.cpuChart = null;
        this.memoryChart = null;
        this.networkChart = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupEventSource();
        this.setupCharts();
        this.setupEventHandlers();
    }
    
    setupEventSource() {
        try {
            this.eventSource = new EventSource('/metrics/sse');
            this.setupSSEHandlers();
        } catch (error) {
            console.error('Failed to create EventSource:', error);
            this.fallbackToPolling();
        }
    }
    
    setupSSEHandlers() {
        this.eventSource.onopen = () => {
            console.log('SSE connection established');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus('connected');
        };
        
        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMetricsUpdate(data);
            } catch (error) {
                console.error('Failed to parse SSE data:', error);
            }
        };
        
        this.eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            this.isConnected = false;
            this.updateConnectionStatus('error');
            this.handleReconnection();
        };
        
        this.eventSource.onclose = () => {
            console.log('SSE connection closed');
            this.isConnected = false;
            this.updateConnectionStatus('disconnected');
        };
    }
    
    fallbackToPolling() {
        console.log('Falling back to polling mode');
        this.updateConnectionStatus('polling');
        this.startPolling();
    }
    
    startPolling() {
        setInterval(async () => {
            try {
                const response = await fetch('/metrics/json');
                const data = await response.json();
                this.handleMetricsUpdate(data);
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 5000); // Poll every 5 seconds
    }
    
    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.setupEventSource();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached, falling back to polling');
            this.fallbackToPolling();
        }
    }
    
    handleMetricsUpdate(data) {
        // Store latest metrics
        this.metricsData = data;
        
        // Update UI components
        this.updateSystemMetrics(data.system);
        this.updateAIMetrics(data.ai);
        this.updateServerMetrics(data.server);
        
        // Update charts
        this.updateCharts(data);
        
        // Update timestamp
        this.updateTimestamp(data.timestamp || new Date().toISOString());
    }
    
    updateSystemMetrics(system) {
        if (!system) return;
        
        // CPU metrics
        if (system.cpu) {
            this.updateElement('cpu-usage', `${system.cpu.usage_percent.toFixed(1)}%`);
            this.updateElement('cpu-count', system.cpu.count);
            this.updateElement('cpu-freq', `${system.cpu.frequency_mhz.toFixed(0)} MHz`);
        }
        
        // Memory metrics
        if (system.memory) {
            this.updateElement('memory-usage', `${system.memory.usage_percent.toFixed(1)}%`);
            this.updateElement('memory-used', `${system.memory.used_gb.toFixed(1)} GB`);
            this.updateElement('memory-total', `${system.memory.total_gb.toFixed(1)} GB`);
            this.updateElement('memory-free', `${system.memory.free_gb.toFixed(1)} GB`);
        }
        
        // Disk metrics
        if (system.disk) {
            this.updateElement('disk-usage', `${system.disk.usage_percent.toFixed(1)}%`);
            this.updateElement('disk-used', `${system.disk.used_gb.toFixed(1)} GB`);
            this.updateElement('disk-total', `${system.disk.total_gb.toFixed(1)} GB`);
            this.updateElement('disk-free', `${system.disk.free_gb.toFixed(1)} GB`);
        }
        
        // Network metrics
        if (system.network) {
            this.updateElement('network-sent', `${system.network.bytes_sent_mb.toFixed(1)} MB`);
            this.updateElement('network-recv', `${system.network.bytes_recv_mb.toFixed(1)} MB`);
        }
        
        // System info
        if (system.system) {
            this.updateElement('processes', system.system.processes);
            this.updateElement('uptime', this.formatUptime(system.system.uptime_seconds));
            this.updateElement('platform', system.system.platform);
        }
    }
    
    updateAIMetrics(ai) {
        if (!ai || !ai.ai_components) return;
        
        const components = ai.ai_components;
        
        // Tinygrad status
        if (components.tinygrad) {
            this.updateElement('tinygrad-status', components.tinygrad.status);
            this.updateElement('tinygrad-artifacts', components.tinygrad.artifacts_count);
            this.updateElement('tinygrad-updated', this.formatTimestamp(components.tinygrad.last_updated));
        }
        
        // Petals status
        if (components.petals) {
            this.updateElement('petals-status', components.petals.status);
            this.updateElement('petals-blocks', components.petals.cache_blocks);
            this.updateElement('petals-updated', this.formatTimestamp(components.petals.last_updated));
        }
        
        // Wondercraft status
        if (components.wondercraft) {
            this.updateElement('wondercraft-status', components.wondercraft.status);
            this.updateElement('wondercraft-scenes', components.wondercraft.scenes_count);
            this.updateElement('wondercraft-overlays', components.wondercraft.xr_overlays);
            this.updateElement('wondercraft-updated', this.formatTimestamp(components.wondercraft.last_updated));
        }
    }
    
    updateServerMetrics(server) {
        if (!server) return;
        
        this.updateElement('clients-connected', server.clients_connected);
        this.updateElement('server-uptime', this.formatUptime(server.uptime_seconds));
    }
    
    updateCharts(data) {
        if (!data.system) return;
        
        const timestamp = new Date(data.timestamp || Date.now());
        
        // CPU chart
        if (this.cpuChart && data.system.cpu) {
            this.cpuChart.data.labels.push(timestamp.toLocaleTimeString());
            this.cpuChart.data.datasets[0].data.push(data.system.cpu.usage_percent);
            
            // Keep only last 20 data points
            if (this.cpuChart.data.labels.length > 20) {
                this.cpuChart.data.labels.shift();
                this.cpuChart.data.datasets[0].data.shift();
            }
            
            this.cpuChart.update('none');
        }
        
        // Memory chart
        if (this.memoryChart && data.system.memory) {
            this.memoryChart.data.labels.push(timestamp.toLocaleTimeString());
            this.memoryChart.data.datasets[0].data.push(data.system.memory.usage_percent);
            
            if (this.memoryChart.data.labels.length > 20) {
                this.memoryChart.data.labels.shift();
                this.memoryChart.data.datasets[0].data.shift();
            }
            
            this.memoryChart.update('none');
        }
        
        // Network chart
        if (this.networkChart && data.system.network) {
            this.networkChart.data.labels.push(timestamp.toLocaleTimeString());
            this.networkChart.data.datasets[0].data.push(data.system.network.bytes_sent_mb);
            this.networkChart.data.datasets[1].data.push(data.system.network.bytes_recv_mb);
            
            if (this.networkChart.data.labels.length > 20) {
                this.networkChart.data.labels.shift();
                this.networkChart.data.datasets[0].data.shift();
                this.networkChart.data.datasets[1].data.shift();
            }
            
            this.networkChart.update('none');
        }
    }
    
    setupCharts() {
        // CPU Usage Chart
        const cpuCtx = document.getElementById('cpu-chart');
        if (cpuCtx) {
            this.cpuChart = new Chart(cpuCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'CPU Usage %',
                        data: [],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
        
        // Memory Usage Chart
        const memoryCtx = document.getElementById('memory-chart');
        if (memoryCtx) {
            this.memoryChart = new Chart(memoryCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Memory Usage %',
                        data: [],
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
        
        // Network Chart
        const networkCtx = document.getElementById('network-chart');
        if (networkCtx) {
            this.networkChart = new Chart(networkCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Bytes Sent (MB)',
                        data: [],
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Bytes Received (MB)',
                        data: [],
                        borderColor: 'rgb(168, 85, 247)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
    
    setupEventHandlers() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-metrics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshMetrics();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('export-metrics');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportMetrics();
            });
        }
    }
    
    async refreshMetrics() {
        try {
            const response = await fetch('/metrics/json');
            const data = await response.json();
            this.handleMetricsUpdate(data);
        } catch (error) {
            console.error('Failed to refresh metrics:', error);
        }
    }
    
    exportMetrics() {
        if (!this.metricsData) return;
        
        const dataStr = JSON.stringify(this.metricsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `metrics_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        link.click();
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status-${status}`;
        }
    }
    
    updateTimestamp(timestamp) {
        const timestampElement = document.getElementById('last-update');
        if (timestampElement) {
            timestampElement.textContent = this.formatTimestamp(timestamp);
        }
    }
    
    formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch (error) {
            return timestamp;
        }
    }
    
    formatUptime(seconds) {
        if (!seconds) return 'N/A';
        
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
    
    destroy() {
        if (this.eventSource) {
            this.eventSource.close();
        }
        
        if (this.cpuChart) {
            this.cpuChart.destroy();
        }
        
        if (this.memoryChart) {
            this.memoryChart.destroy();
        }
        
        if (this.networkChart) {
            this.networkChart.destroy();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.metricsClient = new LiveMetricsClient();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.metricsClient) {
        window.metricsClient.destroy();
    }
});
