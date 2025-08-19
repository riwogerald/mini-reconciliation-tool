import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Link, Trash2, Plus } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ParsedFile, FilePair, FileUploadError } from '../types/transaction';
import { parseCSVFile } from '../utils/csvProcessor';

interface BatchFileUploadProps {
  onFilePairsChanged: (filePairs: FilePair[]) => void;
  onErrorsChanged: (errors: FileUploadError[]) => void;
  isProcessing?: boolean;
}

export const BatchFileUpload: React.FC<BatchFileUploadProps> = ({
  onFilePairsChanged,
  onErrorsChanged,
  isProcessing = false
}) => {
  const [internalFiles, setInternalFiles] = useState<ParsedFile[]>([]);
  const [providerFiles, setProviderFiles] = useState<ParsedFile[]>([]);
  const [filePairs, setFilePairs] = useState<FilePair[]>([]);
  const [errors, setErrors] = useState<FileUploadError[]>([]);
  const [draggedFiles, setDraggedFiles] = useState<'internal' | 'provider' | null>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const addError = useCallback((fileName: string, error: string) => {
    const newError: FileUploadError = {
      fileName,
      error,
      timestamp: new Date()
    };
    setErrors(prev => {
      const updated = [...prev, newError];
      onErrorsChanged(updated);
      return updated;
    });
  }, [onErrorsChanged]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    onErrorsChanged([]);
  }, [onErrorsChanged]);

  const processFiles = useCallback(async (files: FileList | File[], type: 'internal' | 'provider') => {
    setIsProcessingFiles(true);
    const fileArray = Array.from(files);
    const validFiles: ParsedFile[] = [];

    for (const file of fileArray) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        addError(file.name, 'File must be a CSV file');
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        addError(file.name, 'File size must be less than 10MB');
        continue;
      }

      try {
        const parsedFile = await parseCSVFile(file);
        validFiles.push(parsedFile);
      } catch (err) {
        addError(file.name, err instanceof Error ? err.message : 'Failed to process file');
      }
    }

    if (type === 'internal') {
      setInternalFiles(prev => [...prev, ...validFiles]);
    } else {
      setProviderFiles(prev => [...prev, ...validFiles]);
    }

    setIsProcessingFiles(false);
  }, [addError]);

  const handleDrop = useCallback((e: React.DragEvent, type: 'internal' | 'provider') => {
    e.preventDefault();
    setDraggedFiles(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files, type);
    }
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'internal' | 'provider') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files, type);
    }
    e.target.value = '';
  }, [processFiles]);

  const removeFile = useCallback((fileName: string, type: 'internal' | 'provider') => {
    if (type === 'internal') {
      setInternalFiles(prev => prev.filter(f => f.name !== fileName));
    } else {
      setProviderFiles(prev => prev.filter(f => f.name !== fileName));
    }
    
    // Remove file pairs that include this file
    setFilePairs(prev => {
      const updated = prev.filter(pair => 
        pair.internalFile.name !== fileName && pair.providerFile.name !== fileName
      );
      onFilePairsChanged(updated);
      return updated;
    });
  }, [onFilePairsChanged]);

  const createFilePair = useCallback((internalFile: ParsedFile, providerFile: ParsedFile) => {
    const newPair: FilePair = {
      id: `${internalFile.name}-${providerFile.name}-${Date.now()}`,
      internalFile,
      providerFile,
      status: 'pending',
      createdAt: new Date()
    };

    setFilePairs(prev => {
      const updated = [...prev, newPair];
      onFilePairsChanged(updated);
      return updated;
    });
  }, [onFilePairsChanged]);

  const removeFilePair = useCallback((pairId: string) => {
    setFilePairs(prev => {
      const updated = prev.filter(pair => pair.id !== pairId);
      onFilePairsChanged(updated);
      return updated;
    });
  }, [onFilePairsChanged]);

  const getAvailableFiles = (type: 'internal' | 'provider') => {
    const files = type === 'internal' ? internalFiles : providerFiles;
    const pairedFileNames = new Set(
      filePairs.map(pair => type === 'internal' ? pair.internalFile.name : pair.providerFile.name)
    );
    return files.filter(file => !pairedFileNames.has(file.name));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FileDropZone: React.FC<{
    type: 'internal' | 'provider';
    title: string;
    files: ParsedFile[];
  }> = ({ type, title, files }) => (
    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 transition-all duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          draggedFiles === type
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        } ${isProcessingFiles ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDraggedFiles(type);
        }}
        onDragLeave={() => setDraggedFiles(null)}
        onDrop={(e) => handleDrop(e, type)}
      >
        <input
          type="file"
          accept=".csv"
          multiple
          onChange={(e) => handleFileInput(e, type)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessingFiles || isProcessing}
        />
        
        <div className="space-y-4">
          {isProcessingFiles ? (
            <LoadingSpinner size="lg" className="mx-auto text-blue-500" />
          ) : (
            <Upload className={`w-12 h-12 mx-auto transition-colors duration-200 ${
              draggedFiles === type ? 'text-blue-500' : 'text-gray-400'
            }`} />
          )}
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isProcessingFiles ? 'Processing files...' : 
               draggedFiles === type ? 'Drop your files here' : 'Drop CSV files here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse and select multiple files
            </p>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>CSV files only • Max 10MB per file</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-gray-900">Uploaded Files ({files.length})</h4>
          {files.map((file) => (
            <div key={file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {file.data.length} transactions • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.name, type)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-medium text-red-800">Upload Errors</h3>
            </div>
            <button
              onClick={clearErrors}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700">
                <span className="font-medium">{error.fileName}:</span> {error.error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FileDropZone
          type="internal"
          title="Internal System Exports"
          files={internalFiles}
        />
        <FileDropZone
          type="provider"
          title="Provider Statements"
          files={providerFiles}
        />
      </div>

      {/* File Pairing Section */}
      {(internalFiles.length > 0 || providerFiles.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">File Pairing for Reconciliation</h3>
          
          {/* Create New Pairs */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Create File Pairs</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const internalFile = internalFiles.find(f => f.name === e.target.value);
                  if (internalFile) {
                    const availableProvider = getAvailableFiles('provider')[0];
                    if (availableProvider) {
                      createFilePair(internalFile, availableProvider);
                      e.target.value = '';
                    }
                  }
                }}
                disabled={isProcessing}
              >
                <option value="">Select Internal File...</option>
                {getAvailableFiles('internal').map(file => (
                  <option key={file.name} value={file.name}>{file.name}</option>
                ))}
              </select>
              
              <div className="flex items-center justify-center">
                <Link className="w-5 h-5 text-gray-400" />
              </div>
              
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const providerFile = providerFiles.find(f => f.name === e.target.value);
                  if (providerFile) {
                    const availableInternal = getAvailableFiles('internal')[0];
                    if (availableInternal) {
                      createFilePair(availableInternal, providerFile);
                      e.target.value = '';
                    }
                  }
                }}
                disabled={isProcessing}
              >
                <option value="">Select Provider File...</option>
                {getAvailableFiles('provider').map(file => (
                  <option key={file.name} value={file.name}>{file.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Existing File Pairs */}
          {filePairs.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">
                File Pairs Ready for Processing ({filePairs.length})
              </h4>
              <div className="space-y-3">
                {filePairs.map((pair) => (
                  <div key={pair.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{pair.internalFile.name}</div>
                        <div className="text-gray-500">{pair.internalFile.data.length} transactions</div>
                      </div>
                      <Link className="w-5 h-5 text-blue-500" />
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{pair.providerFile.name}</div>
                        <div className="text-gray-500">{pair.providerFile.data.length} transactions</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFilePair(pair.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      disabled={isProcessing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filePairs.length === 0 && (internalFiles.length > 0 || providerFiles.length > 0) && (
            <div className="text-center py-8 text-gray-500">
              <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Create file pairs by selecting files from the dropdowns above</p>
              <p className="text-sm mt-1">Each pair will be processed separately during batch reconciliation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
