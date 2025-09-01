// Legacy CSV processor - now using the new multi-format system
// This file maintains backward compatibility while using the new architecture

import { ParsedFile } from '../types/transaction';
import { parseFile, exportData, SupportedFormat } from './processors';

// Backward compatibility function for parseCSVFile
export const parseCSVFile = async (file: File): Promise<ParsedFile> => {
  // Validate that it's actually a CSV file
  if (!file.name.toLowerCase().endsWith('.csv')) {
    throw new Error('File must be a CSV file');
  }
  
  return await parseFile(file);
};

// Backward compatibility function for exportToCSV
export const exportToCSV = (data: any[], filename: string): void => {
  // Ensure filename has .csv extension
  const csvFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  exportData(data, csvFilename, SupportedFormat.CSV);
};
