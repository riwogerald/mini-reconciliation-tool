import { FileProcessorFactory, SupportedFormat } from '../fileProcessor';
import { CSVProcessor } from './csvProcessor';
import { ExcelProcessor } from './excelProcessor';
import { JSONProcessor } from './jsonProcessor';
import { TSVProcessor } from './tsvProcessor';

// Initialize and register all processors
const initializeProcessors = () => {
  FileProcessorFactory.registerProcessor(SupportedFormat.CSV, new CSVProcessor());
  FileProcessorFactory.registerProcessor(SupportedFormat.EXCEL, new ExcelProcessor());
  FileProcessorFactory.registerProcessor(SupportedFormat.JSON, new JSONProcessor());
  FileProcessorFactory.registerProcessor(SupportedFormat.TSV, new TSVProcessor());
};

// Initialize processors when the module is loaded
initializeProcessors();

// Export the factory and processors
export { FileProcessorFactory, SupportedFormat };
export { CSVProcessor } from './csvProcessor';
export { ExcelProcessor } from './excelProcessor';
export { JSONProcessor } from './jsonProcessor';
export { TSVProcessor } from './tsvProcessor';

// Convenience function to parse any supported file
export const parseFile = async (file: File) => {
  const processor = FileProcessorFactory.getProcessor(file);
  return await processor.parse(file);
};

// Convenience function to export data in a specific format
export const exportData = (data: any[], filename: string, format?: SupportedFormat) => {
  let processor;
  
  if (format) {
    // Use specific format
    const processors = new Map([
      [SupportedFormat.CSV, new CSVProcessor()],
      [SupportedFormat.EXCEL, new ExcelProcessor()],
      [SupportedFormat.JSON, new JSONProcessor()],
      [SupportedFormat.TSV, new TSVProcessor()]
    ]);
    
    processor = processors.get(format);
    if (!processor) {
      throw new Error(`Unsupported export format: ${format}`);
    }
  } else {
    // Auto-detect format from filename
    const tempFile = new File([], filename);
    processor = FileProcessorFactory.getProcessor(tempFile);
  }
  
  processor.export(data, filename);
};
