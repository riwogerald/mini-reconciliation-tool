import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalyticsData, PDFReportOptions } from '../types/analytics';
import { ReconciliationResult, BatchReconciliationResult } from '../types/transaction';

export class PDFReportGenerator {
  private static readonly PAGE_WIDTH = 210; // A4 width in mm
  private static readonly PAGE_HEIGHT = 297; // A4 height in mm
  private static readonly MARGIN = 20;
  private static readonly CONTENT_WIDTH = PDFReportGenerator.PAGE_WIDTH - (2 * PDFReportGenerator.MARGIN);

  /**
   * Generate comprehensive PDF report with analytics data
   */
  static async generateAnalyticsReport(
    analyticsData: AnalyticsData,
    currentResult: ReconciliationResult | BatchReconciliationResult,
    options: PDFReportOptions = {
      includeCharts: true,
      includeInsights: true,
      includeDetailedBreakdown: true,
      reportTitle: 'Reconciliation Analytics Report',
      generatedBy: 'Mini Reconciliation Tool'
    }
  ): Promise<void> {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    let currentY = PDFReportGenerator.MARGIN;

    // Title page
    currentY = this.addTitle(pdf, options.reportTitle, currentY);
    currentY = this.addMetadata(pdf, analyticsData, options.generatedBy, currentY);
    
    // Executive Summary
    if (analyticsData.historicalTrends.length > 0) {
      currentY = this.addExecutiveSummary(pdf, analyticsData, currentY);
    }

    // Key Insights
    if (options.includeInsights && analyticsData.insights.length > 0) {
      currentY = this.addKeyInsights(pdf, analyticsData.insights, currentY);
    }

    // Performance Metrics
    currentY = this.addPerformanceMetrics(pdf, analyticsData.performanceMetrics, currentY);

    // Current Result Summary
    currentY = this.addCurrentResultSummary(pdf, currentResult, currentY);

    // Detailed Breakdown
    if (options.includeDetailedBreakdown) {
      currentY = this.addDetailedBreakdown(pdf, analyticsData, currentY);
    }

    // Charts (if requested and elements exist)
    if (options.includeCharts) {
      await this.addChartsToPDF(pdf, currentY);
    }

    // Footer
    this.addFooter(pdf);

    // Download the PDF
    const filename = `reconciliation-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  }

  /**
   * Add title and header to PDF
   */
  private static addTitle(pdf: jsPDF, title: string, y: number): number {
    // Main title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235); // Blue color
    pdf.text(title, PDFReportGenerator.MARGIN, y);
    y += 15;

    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99); // Gray color
    pdf.text('Advanced Analytics & Insights', PDFReportGenerator.MARGIN, y);
    y += 20;

    return y;
  }

  /**
   * Add metadata section
   */
  private static addMetadata(pdf: jsPDF, analyticsData: AnalyticsData, generatedBy: string, y: number): number {
    const now = new Date();
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    
    pdf.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, PDFReportGenerator.MARGIN, y);
    pdf.text(`Report Tool: ${generatedBy}`, PDFReportGenerator.MARGIN, y + 5);
    pdf.text(`Data Range: ${analyticsData.historicalTrends.length} reconciliation sessions`, PDFReportGenerator.MARGIN, y + 10);
    
    return y + 25;
  }

  /**
   * Add executive summary
   */
  private static addExecutiveSummary(pdf: jsPDF, analyticsData: AnalyticsData, y: number): number {
    y = this.checkPageBreak(pdf, y, 40);
    
    // Section header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Executive Summary', PDFReportGenerator.MARGIN, y);
    y += 10;

    // Summary content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const summary = `
Performance Overview:
• Total Reconciliations: ${analyticsData.performanceMetrics.totalReconciliations}
• Transactions Processed: ${analyticsData.performanceMetrics.totalTransactionsProcessed.toLocaleString()}
• Average Match Rate: ${analyticsData.performanceMetrics.averageMatchRate.toFixed(1)}%
• Average Processing Time: ${(analyticsData.performanceMetrics.averageProcessingTime / 1000).toFixed(2)}s

Key Findings:
${analyticsData.insights.filter(i => i.impact === 'high').slice(0, 3).map(insight => 
  `• ${insight.title}: ${insight.description}`
).join('\n')}
    `.trim();

    const lines = pdf.splitTextToSize(summary, PDFReportGenerator.CONTENT_WIDTH);
    pdf.text(lines, PDFReportGenerator.MARGIN, y);
    
    return y + (lines.length * 4) + 15;
  }

  /**
   * Add key insights section
   */
  private static addKeyInsights(pdf: jsPDF, insights: AnalyticsInsight[], y: number): number {
    y = this.checkPageBreak(pdf, y, 60);
    
    // Section header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Key Insights', PDFReportGenerator.MARGIN, y);
    y += 12;

    insights.slice(0, 6).forEach((insight, index) => {
      y = this.checkPageBreak(pdf, y, 20);
      
      // Insight title
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const color = this.getInsightColor(insight.type);
      pdf.setTextColor(color.r, color.g, color.b);
      pdf.text(`${index + 1}. ${insight.title}`, PDFReportGenerator.MARGIN, y);
      y += 6;

      // Insight description
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      const descLines = pdf.splitTextToSize(insight.description, PDFReportGenerator.CONTENT_WIDTH - 10);
      pdf.text(descLines, PDFReportGenerator.MARGIN + 5, y);
      y += descLines.length * 3;

      // Recommendation
      if (insight.recommendation) {
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 116, 139);
        const recLines = pdf.splitTextToSize(`💡 ${insight.recommendation}`, PDFReportGenerator.CONTENT_WIDTH - 10);
        pdf.text(recLines, PDFReportGenerator.MARGIN + 5, y);
        y += recLines.length * 3;
      }
      
      y += 5; // Space between insights
    });

    return y + 10;
  }

  /**
   * Add performance metrics
   */
  private static addPerformanceMetrics(pdf: jsPDF, metrics: any, y: number): number {
    y = this.checkPageBreak(pdf, y, 40);
    
    // Section header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Performance Metrics', PDFReportGenerator.MARGIN, y);
    y += 12;

    // Metrics in grid format
    const metricsData = [
      ['Average Match Rate', `${metrics.averageMatchRate.toFixed(1)}%`],
      ['Processing Time', `${(metrics.averageProcessingTime / 1000).toFixed(2)}s`],
      ['Total Sessions', metrics.totalReconciliations.toString()],
      ['Total Transactions', metrics.totalTransactionsProcessed.toLocaleString()]
    ];

    pdf.setFontSize(10);
    metricsData.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text(label + ':', PDFReportGenerator.MARGIN, y);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text(value, PDFReportGenerator.MARGIN + 60, y);
      y += 6;
    });

    return y + 15;
  }

  /**
   * Add current result summary
   */
  private static addCurrentResultSummary(pdf: jsPDF, result: ReconciliationResult | BatchReconciliationResult, y: number): number {
    y = this.checkPageBreak(pdf, y, 40);
    
    // Section header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Current Session Results', PDFReportGenerator.MARGIN, y);
    y += 12;

    const stats = 'stats' in result ? result.stats : result.aggregateStats;
    const isBatch = 'aggregateStats' in result;

    pdf.setFontSize(10);
    
    if (isBatch) {
      const summaryData = [
        ['File Pairs Processed', stats.totalFilePairs.toString()],
        ['Successful Pairs', stats.successfulPairs.toString()],
        ['Failed Pairs', stats.failedPairs.toString()],
        ['Total Transactions', (stats.totalTransactionsInternal + stats.totalTransactionsProvider).toLocaleString()],
        ['Overall Match Rate', `${stats.overallMatchRate.toFixed(1)}%`]
      ];

      summaryData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(75, 85, 99);
        pdf.text(label + ':', PDFReportGenerator.MARGIN, y);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text(value, PDFReportGenerator.MARGIN + 60, y);
        y += 6;
      });
    } else {
      const summaryData = [
        ['Internal Transactions', stats.totalInternal.toString()],
        ['Provider Transactions', stats.totalProvider.toString()],
        ['Matched Transactions', stats.matched.toString()],
        ['Match Rate', `${stats.matchRate.toFixed(1)}%`]
      ];

      summaryData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(75, 85, 99);
        pdf.text(label + ':', PDFReportGenerator.MARGIN, y);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text(value, PDFReportGenerator.MARGIN + 60, y);
        y += 6;
      });
    }

    return y + 15;
  }

  /**
   * Add detailed breakdown section
   */
  private static addDetailedBreakdown(pdf: jsPDF, analyticsData: AnalyticsData, y: number): number {
    y = this.checkPageBreak(pdf, y, 60);
    
    // Section header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Detailed Analysis', PDFReportGenerator.MARGIN, y);
    y += 12;

    // Amount Distribution
    if (analyticsData.amountDistribution.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transaction Amount Distribution', PDFReportGenerator.MARGIN, y);
      y += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      analyticsData.amountDistribution.forEach(dist => {
        pdf.text(`${dist.range}: ${dist.count} transactions (${dist.percentage.toFixed(1)}%)`, PDFReportGenerator.MARGIN + 5, y);
        y += 4;
      });
      y += 8;
    }

    // Status Breakdown
    if (analyticsData.statusBreakdown.length > 0) {
      y = this.checkPageBreak(pdf, y, 30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transaction Status Breakdown', PDFReportGenerator.MARGIN, y);
      y += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      analyticsData.statusBreakdown.forEach(status => {
        pdf.text(
          `${status.status}: ${status.count} (${status.percentage.toFixed(1)}%) - Avg: $${status.averageAmount.toFixed(2)}`, 
          PDFReportGenerator.MARGIN + 5, 
          y
        );
        y += 4;
      });
      y += 8;
    }

    // Mismatch Patterns
    if (analyticsData.mismatchPatterns.length > 0) {
      y = this.checkPageBreak(pdf, y, 30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Common Mismatch Patterns', PDFReportGenerator.MARGIN, y);
      y += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      analyticsData.mismatchPatterns.slice(0, 5).forEach(pattern => {
        pdf.text(
          `${pattern.field}: ${pattern.frequency} occurrences (${pattern.percentage.toFixed(1)}%)`, 
          PDFReportGenerator.MARGIN + 5, 
          y
        );
        y += 4;
      });
    }

    return y;
  }

  /**
   * Capture charts as images and add to PDF
   */
  private static async addChartsToPDF(pdf: jsPDF, startY: number): Promise<number> {
    let y = startY;
    
    try {
      // Find chart containers
      const chartContainers = document.querySelectorAll('[data-chart-type]');
      
      for (const container of Array.from(chartContainers)) {
        y = this.checkPageBreak(pdf, y, 80);
        
        // Capture chart as image
        const canvas = await html2canvas(container as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = PDFReportGenerator.CONTENT_WIDTH;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add chart title
        const chartTitle = container.getAttribute('data-chart-title') || 'Chart';
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(chartTitle, PDFReportGenerator.MARGIN, y);
        y += 10;

        // Add chart image
        pdf.addImage(imgData, 'PNG', PDFReportGenerator.MARGIN, y, imgWidth, imgHeight);
        y += imgHeight + 15;
      }
    } catch (error) {
      console.warn('Failed to capture charts for PDF:', error);
      
      // Add fallback message
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(150, 150, 150);
      pdf.text('Charts could not be captured in this report.', PDFReportGenerator.MARGIN, y);
      y += 10;
    }

    return y;
  }

  /**
   * Add footer to all pages
   */
  private static addFooter(pdf: jsPDF): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Page number
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        PDFReportGenerator.PAGE_WIDTH - PDFReportGenerator.MARGIN,
        PDFReportGenerator.PAGE_HEIGHT - 10,
        { align: 'right' }
      );
      
      // Tool attribution
      pdf.text(
        'Generated by Mini Reconciliation Tool',
        PDFReportGenerator.MARGIN,
        PDFReportGenerator.PAGE_HEIGHT - 10
      );
    }
  }

  /**
   * Check if we need a page break
   */
  private static checkPageBreak(pdf: jsPDF, currentY: number, requiredSpace: number): number {
    if (currentY + requiredSpace > PDFReportGenerator.PAGE_HEIGHT - PDFReportGenerator.MARGIN) {
      pdf.addPage();
      return PDFReportGenerator.MARGIN;
    }
    return currentY;
  }

  /**
   * Get color for insight type
   */
  private static getInsightColor(type: string): { r: number; g: number; b: number } {
    switch (type) {
      case 'success': return { r: 34, g: 197, b: 94 };   // Green
      case 'warning': return { r: 245, g: 158, b: 11 };  // Amber
      case 'error': return { r: 239, g: 68, b: 68 };     // Red
      case 'info':
      default: return { r: 59, g: 130, b: 246 };         // Blue
    }
  }
}

/**
 * Quick PDF export for current session only
 */
export async function exportQuickPDF(
  result: ReconciliationResult | BatchReconciliationResult,
  filename?: string
): Promise<void> {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  let y = 20;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235);
  pdf.text('Reconciliation Summary Report', 20, y);
  y += 15;

  // Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
  y += 15;

  const stats = 'stats' in result ? result.stats : result.aggregateStats;

  // Results summary
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Summary', 20, y);
  y += 10;

  const summaryData = 'stats' in result ? [
    ['Total Internal', stats.totalInternal.toString()],
    ['Total Provider', stats.totalProvider.toString()],
    ['Matched', stats.matched.toString()],
    ['Internal Only', stats.internalOnly.toString()],
    ['Provider Only', stats.providerOnly.toString()],
    ['Match Rate', `${stats.matchRate.toFixed(1)}%`]
  ] : [
    ['File Pairs', stats.totalFilePairs.toString()],
    ['Successful', stats.successfulPairs.toString()],
    ['Failed', stats.failedPairs.toString()],
    ['Total Transactions', (stats.totalTransactionsInternal + stats.totalTransactionsProvider).toString()],
    ['Match Rate', `${stats.overallMatchRate.toFixed(1)}%`]
  ];

  pdf.setFontSize(10);
  summaryData.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text(label + ':', 25, y);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text(value, 80, y);
    y += 6;
  });

  // Download
  const finalFilename = filename || `reconciliation-summary-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(finalFilename);
}
