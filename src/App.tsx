import React, { useState } from 'react';
import { BarChart3, Upload, RefreshCw, Layers, FileCheck } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { BatchFileUpload } from './components/BatchFileUpload';
import { TransactionTable } from './components/TransactionTable';
import { ReconciliationSummary } from './components/ReconciliationSummary';
import { BatchResults } from './components/BatchResults';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { 
  ParsedFile, 
  ReconciliationResult, 
  ProcessingMode, 
  FilePair, 
  FileUploadError,
  BatchReconciliationResult
} from './types/transaction';
import { reconcileTransactions } from './utils/reconciliation';
import { 
  processBatchReconciliation, 
  validateFilePairs 
} from './utils/batchReconciliation';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

function App() {
  // Processing mode state
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('single');
  
  // Single mode state
  const [internalFile, setInternalFile] = useState<ParsedFile | null>(null);
  const [providerFile, setProviderFile] = useState<ParsedFile | null>(null);
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Batch mode state
  const [filePairs, setFilePairs] = useState<FilePair[]>([]);
  const [batchErrors, setBatchErrors] = useState<FileUploadError[]>([]);
  const [batchResult, setBatchResult] = useState<BatchReconciliationResult | null>(null);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    currentPair?: FilePair;
  } | null>(null);

  const handleReconciliation = async () => {
    if (!internalFile || !providerFile) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      // Add realistic processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = reconcileTransactions(internalFile.data, providerFile.data);
      setReconciliationResult(result);
    } catch (error) {
      console.error('Reconciliation error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred during reconciliation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchReconciliation = async () => {
    if (filePairs.length === 0) return;

    const validation = validateFilePairs(filePairs);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    setIsProcessing(true);
    setError(null);
    setBatchProgress({ current: 0, total: filePairs.length });

    try {
      const result = await processBatchReconciliation(filePairs, {
        onProgress: (current, total, currentPair) => {
          setBatchProgress({ current, total, currentPair });
        },
        onPairCompleted: (pair) => {
          // Update the pairs state with completed pair
          setFilePairs(prev => prev.map(p => p.id === pair.id ? pair : p));
        },
        onPairFailed: (pair, error) => {
          console.error(`Pair ${pair.id} failed:`, error);
          setFilePairs(prev => prev.map(p => p.id === pair.id ? pair : p));
        }
      });

      setBatchResult(result);
    } catch (error) {
      console.error('Batch reconciliation error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred during batch reconciliation');
    } finally {
      setIsProcessing(false);
      setBatchProgress(null);
    }
  };

  const resetAll = () => {
    setInternalFile(null);
    setProviderFile(null);
    setReconciliationResult(null);
    setError(null);
    setFilePairs([]);
    setBatchErrors([]);
    setBatchResult(null);
    setBatchProgress(null);
  };

  const switchMode = (mode: ProcessingMode) => {
    resetAll();
    setProcessingMode(mode);
  };

  const canReconcile = internalFile && providerFile && !isProcessing;
  const canBatchReconcile = filePairs.length > 0 && !isProcessing;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 sm:p-3 rounded-xl shadow-lg">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    Mini Reconciliation Tool
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                    Compare transaction files and identify discrepancies
                  </p>
                </div>
              </div>
              {(internalFile || providerFile) && (
                <button
                  onClick={resetAll}
                  className="flex items-center space-x-2 px-3 py-2 sm:px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset All</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Error Display */}
          {error && (
            <div className="mb-6 sm:mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mode Selection */}
          {!internalFile && !providerFile && filePairs.length === 0 && !batchResult && (
            <section className="mb-8 sm:mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Choose Processing Mode
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
                  Select how you want to process your transaction files
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <button
                    onClick={() => switchMode('single')}
                    className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                      processingMode === 'single'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`p-4 rounded-xl mb-4 ${
                        processingMode === 'single' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <FileCheck className={`w-8 h-8 ${
                          processingMode === 'single' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Single File Reconciliation</h3>
                      <p className="text-gray-600 text-center mb-4">
                        Process one internal file and one provider file at a time
                      </p>
                      <ul className="text-sm text-gray-500 text-left space-y-1">
                        <li>• Simple one-to-one comparison</li>
                        <li>• Quick processing</li>
                        <li>• Detailed results view</li>
                        <li>• Perfect for smaller datasets</li>
                      </ul>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => switchMode('batch')}
                    className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                      processingMode === 'batch'
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`p-4 rounded-xl mb-4 ${
                        processingMode === 'batch' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <Layers className={`w-8 h-8 ${
                          processingMode === 'batch' ? 'text-purple-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Batch Processing</h3>
                      <p className="text-gray-600 text-center mb-4">
                        Process multiple file pairs simultaneously with advanced features
                      </p>
                      <ul className="text-sm text-gray-500 text-left space-y-1">
                        <li>• Multiple file pair processing</li>
                        <li>• Aggregate reporting</li>
                        <li>• Bulk export options</li>
                        <li>• Progress tracking</li>
                      </ul>
                    </div>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Single Mode Content */}
          {processingMode === 'single' && (
            <>
              {/* File Upload Section */}
              <section className="mb-8 sm:mb-12">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <FileCheck className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      Single File Reconciliation
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Upload your internal system export and provider statement to identify discrepancies
                  </p>
                  <button
                    onClick={() => switchMode('batch')}
                    className="mt-4 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    Switch to Batch Processing →
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <FileUpload
                    label="Internal System Export"
                    onFileProcessed={setInternalFile}
                    currentFile={internalFile || undefined}
                    onClearFile={() => {
                      setInternalFile(null);
                      setReconciliationResult(null);
                      setError(null);
                    }}
                  />
                  <FileUpload
                    label="Provider Statement"
                    onFileProcessed={setProviderFile}
                    currentFile={providerFile || undefined}
                    onClearFile={() => {
                      setProviderFile(null);
                      setReconciliationResult(null);
                      setError(null);
                    }}
                  />
                </div>
              </section>

              {/* Reconcile Button */}
              {(internalFile || providerFile) && (
                <section className="mb-8 sm:mb-12 text-center">
                  <div className="inline-flex flex-col items-center space-y-4">
                    <button
                      onClick={handleReconciliation}
                      disabled={!canReconcile}
                      className={`relative px-8 py-4 sm:px-12 sm:py-5 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                        canReconcile
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-3">
                          <LoadingSpinner size="sm" />
                          <span>Processing Reconciliation...</span>
                        </div>
                      ) : (
                        'Run Reconciliation'
                      )}
                    </button>
                    
                    {!canReconcile && (internalFile || providerFile) && !isProcessing && (
                      <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border">
                        Please upload both files to run reconciliation
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* Results Section */}
              {reconciliationResult && (
                <section className="space-y-8 sm:space-y-12">
                  <ReconciliationSummary stats={reconciliationResult.stats} />
                  
                  <div className="space-y-6 sm:space-y-8">
                    <TransactionTable
                      title="Matched Transactions"
                      icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
                      data={reconciliationResult.matched}
                      type="matched"
                      colorScheme="green"
                    />
                    
                    <TransactionTable
                      title="Internal File Only"
                      icon={<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />}
                      data={reconciliationResult.internalOnly}
                      type="internal-only"
                      colorScheme="amber"
                    />
                    
                    <TransactionTable
                      title="Provider File Only"
                      icon={<XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />}
                      data={reconciliationResult.providerOnly}
                      type="provider-only"
                      colorScheme="red"
                    />
                  </div>
                </section>
              )}
            </>
          )}

          {/* Batch Mode Content */}
          {processingMode === 'batch' && (
            <>
              {!batchResult && (
                <>
                  <section className="mb-8 sm:mb-12">
                    <div className="text-center mb-6 sm:mb-8">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <Layers className="w-6 h-6 text-purple-600" />
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                          Batch Processing
                        </h2>
                      </div>
                      <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Upload multiple internal system exports and provider statements for batch reconciliation
                      </p>
                      <button
                        onClick={() => switchMode('single')}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        ← Switch to Single File Mode
                      </button>
                    </div>
                    
                    <BatchFileUpload
                      onFilePairsChanged={setFilePairs}
                      onErrorsChanged={setBatchErrors}
                      isProcessing={isProcessing}
                    />
                  </section>

                  {/* Batch Processing Button */}
                  {filePairs.length > 0 && (
                    <section className="mb-8 sm:mb-12 text-center">
                      <div className="inline-flex flex-col items-center space-y-4">
                        <button
                          onClick={handleBatchReconciliation}
                          disabled={!canBatchReconcile}
                          className={`relative px-8 py-4 sm:px-12 sm:py-5 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                            canBatchReconcile
                              ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isProcessing ? (
                            <div className="flex items-center space-x-3">
                              <LoadingSpinner size="sm" />
                              <span>Processing Batch...</span>
                            </div>
                          ) : (
                            `Run Batch Reconciliation (${filePairs.length} pairs)`
                          )}
                        </button>
                        
                        {!canBatchReconcile && filePairs.length === 0 && !isProcessing && (
                          <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border">
                            Please create file pairs to run batch reconciliation
                          </p>
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* Batch Results */}
              {(batchResult || (isProcessing && batchProgress)) && (
                <section className="space-y-8 sm:space-y-12">
                  <BatchResults
                    result={batchResult || {
                      filePairs,
                      aggregateStats: {
                        totalFilePairs: filePairs.length,
                        successfulPairs: 0,
                        failedPairs: 0,
                        totalTransactionsInternal: 0,
                        totalTransactionsProvider: 0,
                        totalMatched: 0,
                        totalInternalOnly: 0,
                        totalProviderOnly: 0,
                        overallMatchRate: 0,
                        averageProcessingTime: 0
                      },
                      processedAt: new Date(),
                      processingTimeMs: 0
                    }}
                    isProcessing={isProcessing}
                    progress={batchProgress || undefined}
                  />
                </section>
              )}
            </>
          )}

          {/* Welcome State - when no mode selected and no files */}
          {!internalFile && !providerFile && filePairs.length === 0 && !batchResult && (
            <section className="text-center py-12 sm:py-16 lg:py-24">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 shadow-sm border border-gray-200 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 mb-8">
                  <Upload className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 mx-auto mb-6" />
                </div>
                
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Welcome to the Reconciliation Tool
                </h3>
                <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto">
                  Choose your processing mode above to get started with transaction reconciliation.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                  <div className="flex flex-col items-center p-4 sm:p-6 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Smart Matching</h4>
                    <p className="text-sm text-gray-600 text-center">Compare transactions by reference with intelligent algorithms</p>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 sm:p-6 bg-amber-50 rounded-xl border border-amber-200">
                    <AlertTriangle className="w-8 h-8 text-amber-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Detect Mismatches</h4>
                    <p className="text-sm text-gray-600 text-center">Identify amount and status discrepancies automatically</p>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Export Results</h4>
                    <p className="text-sm text-gray-600 text-center">Download detailed reports in CSV format</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;