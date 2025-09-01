import { Transaction, ParsedFile } from '../../types/transaction';
import { FileProcessor } from '../fileProcessor';

export class JSONProcessor implements FileProcessor {
  getSupportedExtensions(): string[] {
    return ['.json'];
  }

  getFormatName(): string {
    return 'JSON (JavaScript Object Notation)';
  }

  async parse(file: File): Promise<ParsedFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let jsonData: any;
          
          try {
            jsonData = JSON.parse(content);
          } catch (parseError) {
            reject(new Error('Invalid JSON format. Please ensure the file contains valid JSON.'));
            return;
          }
          
          // Handle different JSON structures
          let dataArray: any[];
          
          if (Array.isArray(jsonData)) {
            // Direct array of objects
            dataArray = jsonData;
          } else if (jsonData.data && Array.isArray(jsonData.data)) {
            // Wrapped in data property
            dataArray = jsonData.data;
          } else if (jsonData.transactions && Array.isArray(jsonData.transactions)) {
            // Wrapped in transactions property
            dataArray = jsonData.transactions;
          } else if (typeof jsonData === 'object' && jsonData !== null) {
            // Single object - convert to array
            dataArray = [jsonData];
          } else {
            reject(new Error('JSON must contain an array of transaction objects or a single transaction object.'));
            return;
          }
          
          if (dataArray.length === 0) {
            reject(new Error('JSON file contains no transaction data.'));
            return;
          }
          
          // Extract headers from first object and normalize them
          const firstObject = dataArray[0];
          if (typeof firstObject !== 'object' || firstObject === null) {
            reject(new Error('JSON must contain objects with transaction data.'));
            return;
          }
          
          const rawHeaders = Object.keys(firstObject);
          const headers = rawHeaders.map(header => 
            header.trim().toLowerCase().replace(/\s+/g, '_')
          );
          
          // Validate required columns
          const hasTransactionRef = headers.includes('transaction_reference') || 
                                  rawHeaders.some(h => h.toLowerCase().replace(/\s+/g, '_') === 'transaction_reference');
          
          if (!hasTransactionRef) {
            reject(new Error('JSON must contain a "transaction_reference" field. Found fields: ' + rawHeaders.join(', ')));
            return;
          }
          
          // Process and normalize data
          const transactions: Transaction[] = [];
          
          dataArray.forEach((item, index) => {
            if (typeof item !== 'object' || item === null) {
              console.warn(`Skipping invalid item at index ${index}: not an object`);
              return;
            }
            
            const transaction: any = {};
            
            // Normalize field names and process values
            Object.keys(item).forEach(key => {
              const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
              let value = item[key];
              
              // Handle null/undefined values
              if (value === null || value === undefined) {
                value = '';
              } else {
                value = value.toString().trim();
              }
              
              // Convert amount fields to numbers
              if ((normalizedKey.includes('amount') || normalizedKey.includes('value')) && value !== '') {
                const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
                transaction[normalizedKey] = isNaN(numValue) ? value : numValue;
              } else {
                transaction[normalizedKey] = value;
              }
            });
            
            // Only include items with transaction_reference
            if (transaction.transaction_reference && transaction.transaction_reference.toString().trim() !== '') {
              transactions.push(transaction as Transaction);
            }
          });
          
          if (transactions.length === 0) {
            reject(new Error('No valid transactions found. Please ensure your JSON has data in the transaction_reference field.'));
            return;
          }
          
          // Validate data integrity
          const duplicateRefs = this.findDuplicateReferences(transactions);
          if (duplicateRefs.length > 0) {
            console.warn(`Warning: Found duplicate transaction references: ${duplicateRefs.join(', ')}`);
          }
          
          resolve({
            name: file.name,
            data: transactions,
            headers,
            size: file.size
          });
          
        } catch (error) {
          reject(new Error(`Failed to process JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read JSON file'));
      };
      
      reader.readAsText(file);
    });
  }

  export(data: any[], filename: string): void {
    try {
      if (data.length === 0) {
        throw new Error('No data to export');
      }

      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Failed to export JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private findDuplicateReferences(data: Transaction[]): string[] {
    const refCounts = new Map<string, number>();
    const duplicates: string[] = [];

    data.forEach(transaction => {
      const ref = transaction.transaction_reference.toString();
      const count = refCounts.get(ref) || 0;
      refCounts.set(ref, count + 1);
      
      if (count === 1) { // First duplicate occurrence
        duplicates.push(ref);
      }
    });

    return duplicates;
  }
}
