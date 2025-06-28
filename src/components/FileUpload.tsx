import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ParsedFile } from '../types/transaction';
import { parseCSVFile } from '../utils/csvProcessor';

interface FileUploadProps {
  label: string;
  onFileProcessed: (file: ParsedFile) => void;
  currentFile?: ParsedFile;
  onClearFile: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onFileProcessed,
  currentFile,
  onClearFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const parsedFile = await parseCSVFile(file);
      onFileProcessed(parsedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  }, [handleFile]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (currentFile) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-green-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 pr-2">
            {label}
          </h3>
          <button
            onClick={onClearFile}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"
            title="Remove file"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
              <File className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
              {currentFile.name}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-1">
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>{currentFile.data.length} transactions</span>
              </span>
              <span className="hidden sm:block">•</span>
              <span>{formatFileSize(currentFile.size)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
        {label}
      </h3>
      
      {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-red-700 break-words">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
        } ${isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-3 sm:space-y-4">
          {isProcessing ? (
            <LoadingSpinner size="lg" className="mx-auto text-blue-500" />
          ) : (
            <Upload className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto transition-colors duration-200 ${
              isDragOver ? 'text-blue-500' : 'text-gray-400'
            }`} />
          )}
          
          <div>
            <p className="text-base sm:text-lg lg:text-xl font-medium text-gray-900">
              {isProcessing ? 'Processing file...' : 
               isDragOver ? 'Drop your file here' : 'Drop your CSV file here'}
            </p>
            <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
              or click to browse and select a file
            </p>
          </div>
          
          <div className="text-xs sm:text-sm text-gray-400 space-y-1">
            <p>CSV files only • Max 10MB</p>
            <p>Must contain transaction_reference column</p>
          </div>
        </div>
      </div>
    </div>
  );
};