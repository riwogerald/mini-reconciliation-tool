import Papa from 'papaparse';
import { Transaction, ParsedFile } from '../../types/transaction';
import { FileProcessor } from '../fileProcessor';

export class TSVProcessor implements FileProcessor {
  getSupportedExtensions(): string[] {
    return ['.tsv', '.tab'];
  }

  getFormatName(): string {
    return 'TSV (Tab-Separated Values)';
  }

  async parse(file: File): Promise<ParsedFile> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        delimiter: '\t', // Tab delimiter for TSV
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase().replace(/\s+/g, '_'),
        transform: (value: string, header: string) => {
          // Convert amount fields to numbers
          if (header.includes('amount') || header.includes('value')) {
            const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
            return isNaN(numValue) ? value : numValue;
          }
          return value.trim();
        },
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              const criticalErrors = results.errors.filter(error => error.type === 'Delimiter');
              if (criticalErrors.length > 0) {
                reject(new Error(`TSV parsing failed: ${criticalErrors[0].message}`));
                return;
              }
            }

            const data = results.data as Transaction[];
            const headers = results.meta.fields || [];

            // Validate required columns
            if (!headers.includes('transaction_reference')) {
              reject(new Error('TSV must contain a "transaction_reference" column. Found columns: ' + headers.join(', ')));
              return;
            }

            // Filter out rows without transaction_reference
            const validData = data.filter(row => {
              const ref = row.transaction_reference;
              return ref && ref.toString().trim() !== '';
            });

            if (validData.length === 0) {
              reject(new Error('No valid transactions found. Please ensure your TSV has data in the transaction_reference column.'));
              return;
            }

            // Validate data integrity
            const duplicateRefs = this.findDuplicateReferences(validData);
            if (duplicateRefs.length > 0) {
              console.warn(`Warning: Found duplicate transaction references: ${duplicateRefs.join(', ')}`);
            }

            resolve({
              name: file.name,
              data: validData,
              headers,
              size: file.size
            });
          } catch (error) {
            reject(new Error(`Failed to process TSV data: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        },
        error: (error) => {
          reject(new Error(`Failed to parse TSV file: ${error.message}`));
        }
      });
    });
  }

  export(data: any[], filename: string): void {
    try {
      if (data.length === 0) {
        throw new Error('No data to export');
      }

      const tsv = Papa.unparse(data, {
        header: true,
        delimiter: '\t', // Tab delimiter for TSV
        skipEmptyLines: true
      });
      
      const blob = new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8;' });
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
      throw new Error(`Failed to export TSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
