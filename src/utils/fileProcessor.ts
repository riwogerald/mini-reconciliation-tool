import { ParsedFile } from '../types/transaction';

export interface FileProcessor {
  parse(file: File): Promise<ParsedFile>;
  export(data: any[], filename: string): void;
  getSupportedExtensions(): string[];
  getFormatName(): string;
}

export enum SupportedFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
  TSV = 'tsv'
}

export class FileProcessorFactory {
  private static processors: Map<SupportedFormat, FileProcessor> = new Map();

  static registerProcessor(format: SupportedFormat, processor: FileProcessor): void {
    this.processors.set(format, processor);
  }

  static getProcessor(file: File): FileProcessor {
    const extension = this.getFileExtension(file.name);
    const format = this.detectFormat(extension);
    
    const processor = this.processors.get(format);
    if (!processor) {
      throw new Error(`Unsupported file format: ${extension}. Supported formats: ${this.getSupportedExtensions().join(', ')}`);
    }
    
    return processor;
  }

  static detectFormat(extension: string): SupportedFormat {
    switch (extension.toLowerCase()) {
      case '.csv':
        return SupportedFormat.CSV;
      case '.xlsx':
      case '.xls':
        return SupportedFormat.EXCEL;
      case '.json':
        return SupportedFormat.JSON;
      case '.tsv':
      case '.tab':
        return SupportedFormat.TSV;
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
  }

  static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  }

  static getSupportedExtensions(): string[] {
    const extensions: string[] = [];
    this.processors.forEach(processor => {
      extensions.push(...processor.getSupportedExtensions());
    });
    return [...new Set(extensions)]; // Remove duplicates
  }

  static getSupportedFormats(): { format: SupportedFormat; name: string; extensions: string[] }[] {
    const formats: { format: SupportedFormat; name: string; extensions: string[] }[] = [];
    this.processors.forEach((processor, format) => {
      formats.push({
        format,
        name: processor.getFormatName(),
        extensions: processor.getSupportedExtensions()
      });
    });
    return formats;
  }

  static isSupported(filename: string): boolean {
    try {
      const extension = this.getFileExtension(filename);
      this.detectFormat(extension);
      return true;
    } catch {
      return false;
    }
  }
}
