import * as XLSX from 'xlsx';
import { Transaction, ParsedFile } from '../../types/transaction';
import { FileProcessor } from '../fileProcessor';

export class ExcelProcessor implements FileProcessor {
  getSupportedExtensions(): string[] {
    return ['.xlsx', '.xls'];
  }

  getFormatName(): string {
    return 'Excel (Microsoft Excel Spreadsheet)';
  }

  async parse(file: File): Promise<ParsedFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            reject(new Error('Excel file contains no worksheets'));
            return;
          }
          
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false
          }) as any[][];
          
          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }
          
          // Extract headers and normalize them
          const rawHeaders = jsonData[0] as string[];
          const headers = rawHeaders.map(header => 
            header.toString().trim().toLowerCase().replace(/\s+/g, '_')
          );
          
          // Validate required columns
          if (!headers.includes('transaction_reference')) {
            reject(new Error('Excel file must contain a "transaction_reference" column. Found columns: ' + headers.join(', ')));
            return;
          }
          
          // Process data rows
          const transactions: Transaction[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const transaction: any = {};
            
            headers.forEach((header, index) => {
              let value = row[index];
              
              // Handle empty cells
              if (value === undefined || value === null || value === '') {
                value = '';
              } else {
                value = value.toString().trim();
              }
              
              // Convert amount fields to numbers
              if ((header.includes('amount') || header.includes('value')) && value !== '') {
                const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
                transaction[header] = isNaN(numValue) ? value : numValue;
              } else {
                transaction[header] = value;
              }
            });
            
            // Only include rows with transaction_reference
            if (transaction.transaction_reference && transaction.transaction_reference.toString().trim() !== '') {
              transactions.push(transaction as Transaction);
            }
          }
          
          if (transactions.length === 0) {
            reject(new Error('No valid transactions found. Please ensure your Excel file has data in the transaction_reference column.'));
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
          reject(new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  export(data: any[], filename: string): void {
    try {
      if (data.length === 0) {
        throw new Error('No data to export');
      }

      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reconciliation Data');
      
      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, filename);
      
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Failed to export Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
