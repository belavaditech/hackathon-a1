import { LightningElement, api, track, wire } from 'lwc';
import getStrategy from '@salesforce/apex/StrategyService.getStrategy';
import { loadScript } from 'lightning/platformResourceLoader';
import ChartJS from '@salesforce/resourceUrl/ChartJS';

export default class StrategyLegalChart extends LightningElement {
    @api strategyId;
    
    @track legalData = [];
    @track reasons = [];
    @track chart;
    @track isChartJsInitialized = false;
    loadeddata;
    error;

    @wire(getStrategy, { strategyId: '$strategyId' })
    wiredStrategy({ error, data }) {
        if (data) {
            try {
                let cleanedJsonString = data.Legal_data__c
                    .replace(/\u00A0/g, ' ')        // Remove non-breaking spaces
                    .replace(/[“”]/g, '"')           // Replace fancy double quotes
                    .replace(/[‘’]/g, "'")            // Replace fancy single quotes
                    .replace(/\s+/g, ' ')             // Normalize multiple spaces
                    .trim();

                const parsedData = JSON.parse(cleanedJsonString);

                this.legalData = parsedData.legalIssues;
                this.reasons = this.legalData.map(item => ({
                    aspect: item.aspect,
                    reason: item.reason
                }));

                this.error = undefined;
            } catch (e) {
                this.error = e; // Capture parsing error
            }
        } else if (error) {
            this.error = error.body.message;
        }
    }

    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }

        loadScript(this, ChartJS)
            .then(() => {
                this.isChartJsInitialized = true;
                this.renderChart();
            })
            .catch(error => {
                this.error = 'Error loading ChartJS library';
            });
    }

    renderChart() {
        if (!this.isChartJsInitialized || !this.legalData.length) {
            return;
        }

        const canvas = this.template.querySelector('canvas');

        if (this.chart) {
            this.chart.destroy(); // Clean up old chart
        }

        const labels = this.legalData.map(item => item.aspect);
        const scores = this.legalData.map(item => item.severity);

        const ctx = canvas.getContext('2d');

        this.chart = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'legal Impact Score',
                    data: scores,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
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
}
