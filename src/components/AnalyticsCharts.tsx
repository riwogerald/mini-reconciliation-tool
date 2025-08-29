import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendData, AmountDistribution, StatusBreakdown } from '../types/analytics';
import { 
  prepareTrendChartData, 
  prepareAmountDistributionChartData, 
  prepareStatusBreakdownChartData 
} from '../utils/analytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function ChartCard({ title, children, action }: ChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
}

interface TrendChartProps {
  data: TrendData[];
  timeRange: string;
}

export function TrendChart({ data, timeRange }: TrendChartProps) {
  const chartData = prepareTrendChartData(data);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
      },
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.datasetIndex === 0) {
              // Match rate percentage
              label += context.parsed.y.toFixed(1) + '%';
            } else {
              // Transaction count
              label += context.parsed.y.toLocaleString();
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Match Rate (%)'
        },
        min: 0,
        max: 100
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Total Transactions'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  return (
    <ChartCard 
      title="Match Rate Trends" 
      action={
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {timeRange === 'all' ? 'All Time' : timeRange.toUpperCase()}
        </span>
      }
    >
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-sm">No historical data available</p>
            <p className="text-xs text-gray-400 mt-1">Run more reconciliations to see trends</p>
          </div>
        </div>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </ChartCard>
  );
}

interface AmountDistributionChartProps {
  data: AmountDistribution[];
}

export function AmountDistributionChart({ data }: AmountDistributionChartProps) {
  const chartData = prepareAmountDistributionChartData(data);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const percentage = data[context.dataIndex]?.percentage.toFixed(1);
            return `${value.toLocaleString()} transactions (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Amount Range'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Transaction Count'
        },
        beginAtZero: true
      }
    }
  };

  return (
    <ChartCard title="Transaction Amount Distribution">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p className="text-sm">No transaction data available</p>
        </div>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </ChartCard>
  );
}

interface StatusBreakdownChartProps {
  data: StatusBreakdown[];
}

export function StatusBreakdownChart({ data }: StatusBreakdownChartProps) {
  const chartData = prepareStatusBreakdownChartData(data);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const item = data[context.dataIndex];
            return [
              `${context.label}: ${context.parsed.toFixed(1)}%`,
              `Count: ${item.count.toLocaleString()}`,
              `Avg Amount: $${item.averageAmount.toFixed(2)}`
            ];
          }
        }
      }
    }
  };

  return (
    <ChartCard title="Transaction Status Distribution">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p className="text-sm">No status data available</p>
        </div>
      ) : (
        <Doughnut data={chartData} options={options} />
      )}
    </ChartCard>
  );
}

interface MismatchPatternsChartProps {
  data: Array<{ field: string; frequency: number; percentage: number }>;
}

export function MismatchPatternsChart({ data }: MismatchPatternsChartProps) {
  const chartData = {
    labels: data.map(d => d.field.charAt(0).toUpperCase() + d.field.slice(1)),
    datasets: [{
      label: 'Mismatch Frequency',
      data: data.map(d => d.frequency),
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const item = data[context.dataIndex];
            return [
              `${context.label}: ${context.parsed.y} mismatches`,
              `${item.percentage.toFixed(1)}% of all mismatches`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Field Name'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Mismatch Count'
        },
        beginAtZero: true
      }
    }
  };

  return (
    <ChartCard title="Common Mismatch Patterns">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-sm">No mismatches detected</p>
            <p className="text-xs text-gray-400 mt-1">Perfect reconciliation!</p>
          </div>
        </div>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </ChartCard>
  );
}

interface PerformanceMetricsCardProps {
  metrics: {
    averageProcessingTime: number;
    averageMatchRate: number;
    totalReconciliations: number;
    totalTransactionsProcessed: number;
    lastUpdated: Date;
  };
}

export function PerformanceMetricsCard({ metrics }: PerformanceMetricsCardProps) {
  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {metrics.averageMatchRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Average Match Rate</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {formatProcessingTime(metrics.averageProcessingTime)}
          </div>
          <div className="text-sm text-gray-500">Avg Processing Time</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {metrics.totalReconciliations.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Sessions</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {metrics.totalTransactionsProcessed.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Transactions</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Last updated: {metrics.lastUpdated.toLocaleDateString()} {metrics.lastUpdated.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
