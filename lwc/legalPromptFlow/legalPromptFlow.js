import { LightningElement, track, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getStrategy from '@salesforce/apex/StrategyService.getStrategy';

const CASE_FIELDS = ["Case.CaseNumber", "Case.Strategy__c"];

export default class LegalPromptFlow extends LightningElement {
    @track promptResult;
    @track flowVisible = false;
    @track activityType;
    @track analysisJson;
    @track inputVariables;
    @track legalData;
    @track caseRecord;
    @track strategyId;
    @track error;
    @track description;

    @api recordId;

    // Wire to get Case Record
    @wire(getRecord, { recordId: '$recordId', fields: CASE_FIELDS })
    wiredCase({ error, data }) {
        if (data) {
            this.caseRecord = {
                CaseNumber: data.fields.CaseNumber.value,
                StrategyId: data.fields.Strategy__c.value
            };
            this.strategyId = data.fields.Strategy__c.value;
            this.handleRefreshStrategy();
            this.error = undefined;
        } else if (error) {
            this.error = error.body.message;
            this.caseRecord = undefined;
            this.strategyId = undefined;
        }
    }

    // Wire to get related Strategy Record
    @wire(getStrategy, { strategyId: '$strategyId' })
    wiredStrategy({ error, data }) {
        if (data) {
            this.legalData = data.legal_data__c;
            this.description = data.Description__c;
            this.error = undefined;
        } else if (error) {
            this.error = error.body.message;
            this.legalData = undefined;
            this.description = undefined;
        }
    }

    handleRefreshStrategy() {
        refreshApex(this.description); // Triggers re-fetching of record from server
    }

    handleRefreshCase() {
        refreshApex(this.caseRecord);
    }
    

    // Method to Start the Flow
    startFlow() {
        if (!this.caseRecord) return;

        this.inputVariables = [
            {
                name: 'caseid',
                type: 'String',
                value: this.caseRecord.CaseNumber
            }
        ];

        this.flowVisible = true;

        const flowComponent = this.template.querySelector('lightning-flow');
        if (flowComponent) {
            flowComponent.startFlow('Process_legal_data', this.inputVariables);
        }
    }

    // Handler for manual input (if needed)
    handleInput(event) {
        this.activityType = event.target.value;
    }

    // Handler when Flow Status Changes
    handleFlowStatus(event) {
        this.flowVisible = false;
    }
}
