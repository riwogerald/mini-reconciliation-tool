import React, { useState } from 'react';
import { Search, Download, AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, TransactionMatch } from '../types/transaction';
import { exportToCSV } from '../utils/csvProcessor';

interface TransactionTableProps {
  title: string;
  icon: React.ReactNode;
  data: (Transaction | TransactionMatch)[];
  type: 'matched' | 'internal-only' | 'provider-only';
  colorScheme: 'green' | 'amber' | 'red';
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  title,
  icon,
  data,
  type,
  colorScheme
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const colorClasses = {
    green: {
      header: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800',
      badge: 'bg-green-100 text-green-700 border border-green-200',
      button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      empty: 'text-green-500'
    },
    amber: {
      header: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 text-amber-800',
      badge: 'bg-amber-100 text-amber-700 border border-amber-200',
      button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      empty: 'text-amber-500'
    },
    red: {
      header: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800',
      badge: 'bg-red-100 text-red-700 border border-red-200',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      empty: 'text-red-500'
    }
  };

  const colors = colorClasses[colorScheme];

  // Filter data based on search term
  const filteredData = data.filter(item => {
    const searchString = searchTerm.toLowerCase();
    if (type === 'matched') {
      const match = item as TransactionMatch;
      return (
        match.internal.transaction_reference?.toString().toLowerCase().includes(searchString) ||
        match.internal.description?.toLowerCase().includes(searchString) ||
        match.provider.description?.toLowerCase().includes(searchString)
      );
    } else {
      const transaction = item as Transaction;
      return (
        transaction.transaction_reference?.toString().toLowerCase().includes(searchString) ||
        transaction.description?.toLowerCase().includes(searchString)
      );
    }
  });

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    let exportData: any[] = [];
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (type === 'matched') {
      exportData = (data as TransactionMatch[]).map(match => ({
        transaction_reference: match.internal.transaction_reference,
        internal_amount: match.internal.amount,
        provider_amount: match.provider.amount,
        internal_status: match.internal.status,
        provider_status: match.provider.status,
        mismatches: match.mismatches.map(m => `${m.field}: ${m.internalValue} vs ${m.providerValue}`).join('; ') || 'None'
      }));
    } else {
      exportData = data as Transaction[];
    }
    
    exportToCSV(exportData, `${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.csv`);
  };

  const formatAmount = (amount: any): string => {
    if (amount == null) return 'N/A';
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    return isNaN(num) ? amount.toString() : `$${num.toFixed(2)}`;
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            {icon}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
              0
            </span>
          </div>
        </div>
        
        <div className="text-center py-12 sm:py-16">
          <div className={`${colors.empty} mb-4`}>
            {type === 'matched' ? <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" /> :
             type === 'internal-only' ? <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" /> :
             <XCircle className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />}
          </div>
          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No transactions found
          </h4>
          <p className="text-gray-500 text-sm sm:text-base">
            {type === 'matched' ? 'All transactions have been categorized as unmatched' :
             type === 'internal-only' ? 'All internal transactions were found in the provider file' :
             'All provider transactions were found in the internal file'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${colors.header}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            {icon}
            <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
              {data.length}
            </span>
          </div>
          <button
            onClick={handleExport}
            className={`flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 ${colors.button} text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction Reference
              </th>
              {type === 'matched' ? (
                <>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Internal Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Match
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mismatches
                  </th>
                </>
              ) : (
                <>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Description
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                {type === 'matched' ? (
                  (() => {
                    const match = item as TransactionMatch;
                    const amountMismatch = match.mismatches.find(m => m.field === 'amount');
                    const statusMismatch = match.mismatches.find(m => m.field === 'status');
                    
                    return (
                      <>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {match.internal.transaction_reference}
                        </td>
                        <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${amountMismatch ? 'text-red-600 font-medium bg-red-50' : 'text-gray-900'}`}>
                          {formatAmount(match.internal.amount)}
                        </td>
                        <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${amountMismatch ? 'text-red-600 font-medium bg-red-50' : 'text-gray-900'}`}>
                          {formatAmount(match.provider.amount)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {statusMismatch ? (
                            <div className="space-y-1 bg-red-50 p-2 rounded">
                              <div className="text-red-600 font-medium text-xs">Internal: {match.internal.status}</div>
                              <div className="text-red-600 font-medium text-xs">Provider: {match.provider.status}</div>
                            </div>
                          ) : (
                            <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded text-xs">
                              {match.internal.status || 'N/A'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                          {match.mismatches.length > 0 ? (
                            <div className="space-y-1">
                              {match.mismatches.map((mismatch, i) => (
                                <div key={i} className="text-red-600 text-xs bg-red-50 p-1 rounded">
                                  <strong>{mismatch.field}:</strong> {mismatch.internalValue} ≠ {mismatch.providerValue}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium">
                              Perfect match
                            </span>
                          )}
                        </td>
                      </>
                    );
                  })()
                ) : (
                  (() => {
                    const transaction = item as Transaction;
                    return (
                      <>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.transaction_reference}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatAmount(transaction.amount)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {transaction.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate hidden sm:table-cell">
                          {transaction.description || 'N/A'}
                        </td>
                      </>
                    );
                  })()
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <span className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md font-medium">
                {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};