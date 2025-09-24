import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import processCSVContent from '@salesforce/apex/CSVProcessor.processCSVContent';
import getCSVFilesForOpportunity from '@salesforce/apex/CSVProcessor.getCSVFilesForOpportunity';
import getCSVContent from '@salesforce/apex/CSVProcessor.getCSVContent';

export default class CsvUploader extends LightningElement {
    @api recordId; // Opportunity ID from record page
    @track csvData = [];
    @track columns = [];
    @track isLoading = false;
    @track showData = false;
    @track csvFiles = [];
    @track selectedFileId = '';
    @track currentFileName = '';

    // Wire to get existing CSV files for this opportunity
    @wire(getCSVFilesForOpportunity, { opportunityId: '$recordId' })
    wiredCsvFiles(result) {
        this.csvFilesResult = result;
        if (result.data) {
            this.csvFiles = result.data;
        } else if (result.error) {
            this.showToast('Error', 'Failed to load CSV files', 'error');
        }
    }

    get hasFiles() {
        return this.csvFiles && this.csvFiles.length > 0;
    }

    get fileOptions() {
        return this.csvFiles.map(file => ({
            label: `${file.title} (${this.formatDate(file.createdDate)})`,
            value: file.id
        }));
    }

    handleFileChange(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(event) {
        this.selectedFileId = event.detail.value;
        if (this.selectedFileId) {
            this.loadSelectedFile();
        }
    }

    processFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showToast('Error', 'Please select a CSV file', 'error');
            return;
        }

        this.isLoading = true;
        this.currentFileName = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvContent = e.target.result;
            this.uploadCSV(csvContent);
        };
        reader.onerror = () => {
            this.showToast('Error', 'Failed to read file', 'error');
            this.isLoading = false;
        };
        reader.readAsText(file);
    }

    uploadCSV(csvContent) {
        processCSVContent({ 
            csvContent: csvContent, 
            opportunityId: this.recordId 
        })
        .then(result => {
            if (result.success) {
                this.showToast('Success', `CSV processed successfully. ${result.rowCount} rows imported.`, 'success');
                this.displayCSVData(result.data);
                // Refresh the files list
                return refreshApex(this.csvFilesResult);
            } else {
                this.showToast('Error', result.message, 'error');
            }
        })
        .catch(error => {
            this.showToast('Error', 'Failed to process CSV: ' + this.getErrorMessage(error), 'error');
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    loadSelectedFile() {
        this.isLoading = true;
        
        getCSVContent({ contentDocumentId: this.selectedFileId })
        .then(result => {
            if (result.success) {
                this.currentFileName = result.title;
                this.displayCSVData(result.data);
                this.showToast('Success', `Loaded ${result.rowCount} rows from ${result.title}`, 'success');
            } else {
                this.showToast('Error', result.message, 'error');
            }
        })
        .catch(error => {
            this.showToast('Error', 'Failed to load CSV content: ' + this.getErrorMessage(error), 'error');
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    displayCSVData(data) {
        if (data && data.length > 0) {
            // Create columns from the first row keys
            const firstRow = data[0];
            this.columns = Object.keys(firstRow).map(key => ({
                label: key,
                fieldName: key,
                type: 'text',
                wrapText: true
            }));

            // Transform data for datatable
            this.csvData = data.map((row, index) => {
                const transformedRow = { ...row };
                transformedRow.Id = index; // Add unique ID for datatable
                return transformedRow;
            });

            this.showData = true;
        } else {
            this.csvData = [];
            this.columns = [];
            this.showData = false;
        }
    }

    handleRefresh() {
        this.csvData = [];
        this.columns = [];
        this.showData = false;
        this.selectedFileId = '';
        this.currentFileName = '';
        return refreshApex(this.csvFilesResult);
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    getErrorMessage(error) {
        if (error && error.body) {
            if (error.body.message) {
                return error.body.message;
            }
            if (error.body.pageErrors && error.body.pageErrors.length > 0) {
                return error.body.pageErrors[0].message;
            }
        }
        return error.message || 'Unknown error occurred';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
}

