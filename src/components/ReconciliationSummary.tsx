import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { ReconciliationStats } from '../types/transaction';

interface ReconciliationSummaryProps {
  stats: ReconciliationStats;
}

export const ReconciliationSummary: React.FC<ReconciliationSummaryProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Match Rate',
      value: `${stats.matchRate.toFixed(1)}%`,
      icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: stats.matchRate >= 95 ? 'green' : stats.matchRate >= 85 ? 'amber' : 'red',
      description: 'Percentage of internal transactions matched',
      trend: stats.matchRate >= 95 ? 'excellent' : stats.matchRate >= 85 ? 'good' : 'needs-attention'
    },
    {
      title: 'Matched Transactions',
      value: stats.matched.toLocaleString(),
      icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'green',
      description: `${stats.matched} transactions found in both files`,
      trend: 'positive'
    },
    {
      title: 'Internal Only',
      value: stats.internalOnly.toLocaleString(),
      icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'amber',
      description: `${stats.internalOnly} transactions only in internal file`,
      trend: stats.internalOnly === 0 ? 'positive' : 'warning'
    },
    {
      title: 'Provider Only',
      value: stats.providerOnly.toLocaleString(),
      icon: <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'red',
      description: `${stats.providerOnly} transactions only in provider file`,
      trend: stats.providerOnly === 0 ? 'positive' : 'negative'
    }
  ];

  const colorClasses = {
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      text: 'text-green-700',
      icon: 'text-green-600',
      border: 'border-green-200',
      accent: 'bg-green-100'
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      text: 'text-amber-700',
      icon: 'text-amber-600',
      border: 'border-amber-200',
      accent: 'bg-amber-100'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-rose-50',
      text: 'text-red-700',
      icon: 'text-red-600',
      border: 'border-red-200',
      accent: 'bg-red-100'
    }
  };

  return (
    <section className="mb-8 sm:mb-12">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
          Reconciliation Summary
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Overview of transaction matching results and key metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, index) => {
          const colors = colorClasses[card.color as keyof typeof colorClasses];
          return (
            <div
              key={index}
              className={`${colors.bg} ${colors.border} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${colors.accent} p-2 sm:p-3 rounded-lg ${colors.icon}`}>
                  {card.icon}
                </div>
                <div className="text-right">
                  <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${colors.text}`}>
                    {card.value}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className={`font-semibold ${colors.text} mb-1 sm:mb-2 text-sm sm:text-base`}>
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Additional insights */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h4 className="font-semibold text-blue-900 text-sm sm:text-base">
              Reconciliation Complete
            </h4>
            <p className="text-xs sm:text-sm text-blue-700">
              Processed {stats.totalInternal} internal and {stats.totalProvider} provider transactions
            </p>
          </div>
          <div className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
            {stats.matchRate >= 95 ? '✨ Excellent Match Rate' : 
             stats.matchRate >= 85 ? '👍 Good Match Rate' : 
             '⚠️ Review Required'}
          </div>
        </div>
      </div>
    </section>
  );
};