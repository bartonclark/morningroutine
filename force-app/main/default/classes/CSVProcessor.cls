/**
 * CSV Processor class for handling CSV file upload and processing
 * Designed to work with Opportunity records
 */
public with sharing class CSVProcessor {
    
    /**
     * Processes a CSV file and returns parsed data
     * @param csvContent - The CSV content as a string
     * @param opportunityId - The Opportunity ID to associate the data with
     * @return List of parsed CSV rows as maps
     */
    @AuraEnabled
    public static Map<String, Object> processCSVContent(String csvContent, String opportunityId) {
        Map<String, Object> result = new Map<String, Object>();
        
        try {
            // Validate opportunity exists
            if (String.isBlank(opportunityId)) {
                throw new AuraHandledException('Opportunity ID is required');
            }
            
            List<Opportunity> opportunities = [SELECT Id, Name FROM Opportunity WHERE Id = :opportunityId LIMIT 1];
            if (opportunities.isEmpty()) {
                throw new AuraHandledException('Opportunity not found');
            }
            
            // Parse CSV content
            List<Map<String, String>> parsedData = parseCSV(csvContent);
            
            // Store the CSV data (you can modify this to store in custom objects if needed)
            String documentId = storeCSVData(csvContent, opportunityId, 'CSV_Upload_' + System.now().format('yyyy_MM_dd_HH_mm_ss') + '.csv');
            
            result.put('success', true);
            result.put('message', 'CSV processed successfully');
            result.put('rowCount', parsedData.size());
            result.put('data', parsedData);
            result.put('documentId', documentId);
            
        } catch (Exception e) {
            result.put('success', false);
            result.put('message', 'Error processing CSV: ' + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Parse CSV content into a list of maps
     * @param csvContent - Raw CSV string
     * @return List of maps representing each row
     */
    private static List<Map<String, String>> parseCSV(String csvContent) {
        List<Map<String, String>> result = new List<Map<String, String>>();
        
        if (String.isBlank(csvContent)) {
            return result;
        }
        
        List<String> lines = csvContent.split('\n');
        if (lines.isEmpty()) {
            return result;
        }
        
        // Get headers from first row
        List<String> headers = parseCSVLine(lines[0].trim());
        
        // Process data rows
        for (Integer i = 1; i < lines.size(); i++) {
            String line = lines[i].trim();
            if (String.isNotBlank(line)) {
                List<String> values = parseCSVLine(line);
                Map<String, String> rowMap = new Map<String, String>();
                
                for (Integer j = 0; j < headers.size(); j++) {
                    String header = headers[j];
                    String value = j < values.size() ? values[j] : '';
                    rowMap.put(header, value);
                }
                
                result.add(rowMap);
            }
        }
        
        return result;
    }
    
    /**
     * Parse a single CSV line handling quoted values
     * @param line - CSV line to parse
     * @return List of field values
     */
    private static List<String> parseCSVLine(String line) {
        List<String> result = new List<String>();
        
        if (String.isBlank(line)) {
            return result;
        }
        
        Boolean inQuotes = false;
        String currentField = '';
        
        for (Integer i = 0; i < line.length(); i++) {
            String currentChar = line.substring(i, i + 1);
            
            if (currentChar == '"') {
                inQuotes = !inQuotes;
            } else if (currentChar == ',' && !inQuotes) {
                result.add(currentField.trim());
                currentField = '';
            } else {
                currentField += currentChar;
            }
        }
        
        // Add the last field
        result.add(currentField.trim());
        
        return result;
    }
    
    /**
     * Store CSV data as a ContentDocument linked to the Opportunity
     * @param csvContent - The CSV content
     * @param opportunityId - The Opportunity ID
     * @param filename - The filename for the document
     * @return ContentDocument ID
     */
    private static String storeCSVData(String csvContent, String opportunityId, String filename) {
        // Create ContentVersion
        ContentVersion cv = new ContentVersion();
        cv.Title = filename;
        cv.PathOnClient = filename;
        cv.VersionData = Blob.valueOf(csvContent);
        cv.IsMajorVersion = true;
        insert cv;
        
        // Get ContentDocumentId
        ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        
        // Link to Opportunity
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.LinkedEntityId = opportunityId;
        cdl.ContentDocumentId = insertedCV.ContentDocumentId;
        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';
        insert cdl;
        
        return insertedCV.ContentDocumentId;
    }
    
    /**
     * Retrieve CSV data associated with an Opportunity
     * @param opportunityId - The Opportunity ID
     * @return List of CSV files associated with the opportunity
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getCSVFilesForOpportunity(String opportunityId) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();
        
        try {
            List<ContentDocumentLink> links = [
                SELECT ContentDocumentId, ContentDocument.Title, ContentDocument.CreatedDate,
                       ContentDocument.ContentSize, ContentDocument.FileType
                FROM ContentDocumentLink 
                WHERE LinkedEntityId = :opportunityId 
                AND ContentDocument.FileType = 'CSV'
                ORDER BY ContentDocument.CreatedDate DESC
            ];
            
            for (ContentDocumentLink link : links) {
                Map<String, Object> fileInfo = new Map<String, Object>();
                fileInfo.put('id', link.ContentDocumentId);
                fileInfo.put('title', link.ContentDocument.Title);
                fileInfo.put('createdDate', link.ContentDocument.CreatedDate);
                fileInfo.put('size', link.ContentDocument.ContentSize);
                fileInfo.put('fileType', link.ContentDocument.FileType);
                result.add(fileInfo);
            }
            
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving CSV files: ' + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Get CSV content for display
     * @param contentDocumentId - The ContentDocument ID
     * @return Parsed CSV data
     */
    @AuraEnabled
    public static Map<String, Object> getCSVContent(String contentDocumentId) {
        Map<String, Object> result = new Map<String, Object>();
        
        try {
            // Get the latest version of the document
            ContentVersion cv = [
                SELECT VersionData, Title 
                FROM ContentVersion 
                WHERE ContentDocumentId = :contentDocumentId 
                AND IsLatest = true 
                LIMIT 1
            ];
            
            String csvContent = cv.VersionData.toString();
            List<Map<String, String>> parsedData = parseCSV(csvContent);
            
            result.put('success', true);
            result.put('title', cv.Title);
            result.put('data', parsedData);
            result.put('rowCount', parsedData.size());
            
        } catch (Exception e) {
            result.put('success', false);
            result.put('message', 'Error retrieving CSV content: ' + e.getMessage());
        }
        
        return result;
    }
}

