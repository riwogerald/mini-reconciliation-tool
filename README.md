# Mini Reconciliation Tool

![Mini Reconciliation Tool](https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

A modern, web-based reconciliation tool that compares transaction data between internal systems and payment processors to identify discrepancies, ensuring financial accuracy and compliance. Features **powerful batch processing capabilities** for handling multiple file pairs simultaneously, plus an **Advanced Analytics Dashboard** with intelligent insights, interactive charts, and professional PDF reporting!

## You can test the App here: [https://mini-recon-tool.netlify.app/](https://mini-recon-tool.netlify.app/)

## 🎯 Overview

The Mini Reconciliation Tool streamlines the process of comparing transaction files from different sources, automatically identifying matches, mismatches, and discrepancies. Built with modern web technologies, it provides an intuitive interface for financial teams to ensure data accuracy across systems.

![Main dashboard for the Mini Reconciliation Tool.](screenshots/dashboard.png)

### Key Features

#### Core Reconciliation Features
- **🔄 Smart Transaction Matching** - Automatically matches transactions by reference ID with intelligent algorithms
- **📊 Real-time Discrepancy Detection** - Identifies amount, status, and date mismatches with visual highlighting
- **📈 Professional Reporting** - Comprehensive summary dashboard with key metrics and statistics
- **💾 Export Capabilities** - Download detailed reports in CSV format for each category
- **📱 Responsive Design** - Works seamlessly across desktop, tablet, and mobile devices
- **🚀 Client-side Processing** - No server required, all processing happens in your browser for maximum security

#### 🆕 Batch Processing Features
- **📁 Multi-File Upload** - Upload multiple internal and provider files simultaneously
- **🔗 File Pairing Interface** - Intuitive drag-and-drop interface for creating file pairs
- **⚡ Batch Reconciliation** - Process multiple file pairs with queue management
- **📊 Aggregate Reporting** - Combined statistics and insights across all processed pairs
- **📈 Progress Tracking** - Real-time progress updates during batch processing
- **📦 Bulk Export** - Export all results in a comprehensive report bundle
- **🎯 Individual Results** - Expandable detailed view for each file pair
- **🔄 Mode Switching** - Seamlessly switch between single-file and batch processing

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS with responsive design
- **CSV Processing**: Papa Parse library for robust file handling
- **Data Visualization**: Chart.js with React Chart.js 2 for interactive charts
- **PDF Generation**: jsPDF with html2canvas for professional reports
- **Date Processing**: date-fns for robust date manipulation
- **Icons**: Lucide React icon library
- **Development**: ESLint for code quality

## 📋 How It Works

### 1. File Upload
- Drag and drop or click to upload CSV files (max 10MB)
- Supports internal system exports and provider statements
- Real-time validation and error handling
- Automatic detection of required columns

Screenshots Showing Uploads:
![Upload Interface for the Mini Reconciliation Tool.](screenshots/upload.png)
![Upload Interface for the Mini Reconciliation Tool.](screenshots/upload2.png)

### 2. Data Processing
- Parses CSV files with header detection
- Validates transaction_reference column presence
- Cleans and normalizes data for comparison
- Handles various amount formats and currencies

### 3. Reconciliation Engine
- Matches transactions by transaction_reference
- Compares amounts with ±$0.01 tolerance for floating-point precision
- Detects status and date discrepancies
- Categorizes results into matched, internal-only, and provider-only

### 4. Results Dashboard
- **Matched Transactions**: Perfect matches and matches with field mismatches
- **Internal Only**: Transactions present only in internal system
- **Provider Only**: Transactions present only in provider statement
- Visual highlighting of specific field differences

Screenshot showing the reconciliation output:
![Output Interface for the Mini Reconciliation Tool.](screenshots/output1.png)
![Output Interface for the Mini Reconciliation Tool.](screenshots/output2.png)
![Output Interface for the Mini Reconciliation Tool.](screenshots/output3.png)
![Output Interface for the Mini Reconciliation Tool.](screenshots/output4.png)

### 5. Export & Analysis
- Export each category to CSV with timestamped filenames
- Search and pagination for large datasets
- Detailed mismatch analysis with field-level comparisons

## 🆕 Batch Processing Mode

The Mini Reconciliation Tool now includes powerful batch processing capabilities for handling multiple file pairs efficiently. This feature is perfect for organizations that need to process large volumes of reconciliation data regularly.

![Upload Interface for the Mini Reconciliation Tool.](screenshots/batch.png)

### How Batch Processing Works

#### 1. Mode Selection
- Choose between **Single File Mode** (traditional one-to-one comparison) or **Batch Processing Mode**
- Easy toggle between modes with preserved functionality
- Contextual UI that adapts to your selected processing method

#### 2. Multi-File Upload
- **Drag & Drop Multiple Files**: Upload multiple CSV files simultaneously
- **Separate Upload Areas**: Distinct zones for internal system files and provider statements
- **File Management**: Add, remove, and organize files before processing
- **Real-time Validation**: Instant feedback on file format and content

#### 3. File Pairing Interface
- **Visual Pairing**: Intuitive interface for creating file pairs
- **Flexible Matching**: Pair any internal file with any provider file
- **Pair Management**: Add, remove, and modify file pairs as needed
- **Validation**: Ensure all pairs are valid before processing

#### 4. Batch Processing Engine
- **Queue Management**: Process multiple file pairs in sequence
- **Progress Tracking**: Real-time updates showing current progress
- **Error Handling**: Graceful handling of individual pair failures
- **Performance Optimization**: Efficient processing with minimal browser impact

#### 5. Aggregate Results Dashboard
- **Combined Statistics**: Overall metrics across all processed pairs
- **Success Rate Tracking**: Monitor processing success and failure rates
- **Individual Pair Results**: Expandable sections for detailed pair analysis
- **Visual Progress**: Progress bars and status indicators

#### 6. Comprehensive Export Options
- **Bulk Export**: Download all results in a single operation
- **Summary Reports**: Text-based aggregate statistics and insights
- **Individual CSVs**: Separate files for each pair's reconciliation results
- **Timestamped Files**: Organized exports with clear naming conventions

### Batch Processing Benefits

✅ **Efficiency**: Process multiple reconciliations simultaneously  
✅ **Time Savings**: Reduce manual file handling and processing time  
✅ **Consistency**: Standardized processing across all file pairs  
✅ **Visibility**: Clear overview of processing status and results  
✅ **Scalability**: Handle larger reconciliation workloads  
✅ **Organization**: Structured results with comprehensive reporting  

### When to Use Batch Processing

- **Regular Reconciliation Cycles**: Monthly, weekly, or daily reconciliations
- **Multiple Business Units**: Different divisions or departments
- **Multiple Payment Processors**: Various provider statements to reconcile
- **Historical Data Processing**: Batch processing of past periods
- **Large Data Volumes**: When dealing with numerous transaction files

### Batch Processing Workflow

1. **Select Batch Mode** from the main interface
2. **Upload Files** - Add multiple internal and provider files
3. **Create Pairs** - Use the pairing interface to match files
4. **Start Processing** - Run batch reconciliation on all pairs
5. **Monitor Progress** - Watch real-time progress updates
6. **Review Results** - Examine aggregate and individual results
7. **Export Reports** - Download comprehensive result bundles

## 🎯 Advanced Analytics Dashboard

The Mini Reconciliation Tool now features a comprehensive **Analytics Dashboard** that transforms reconciliation data into actionable business intelligence. This advanced feature provides intelligent insights, interactive visualizations, and professional reporting capabilities.

### 📊 Analytics Dashboard Features

#### 🧠 Smart Insights Engine
- **Automated Analysis** - AI-powered insights that identify patterns, anomalies, and trends
- **Performance Scoring** - Match rate analysis with historical comparisons
- **Risk Detection** - Automatic flagging of unusual discrepancies or processing failures
- **Trend Analysis** - Historical performance tracking with deviation alerts
- **Executive Summaries** - Auto-generated plain-text insights for stakeholders

#### 📈 Interactive Data Visualizations
- **Match Rate Trends** - Line charts showing reconciliation performance over time
- **Transaction Volume Analysis** - Dual-axis charts comparing volumes and match rates
- **Amount Distribution** - Bar charts showing transaction value patterns
- **Status Breakdown** - Pie charts with transaction status distribution and averages
- **Mismatch Patterns** - Analysis of common field discrepancies and frequencies

#### 🎨 Professional Reporting
- **PDF Export** - Comprehensive reports with charts, insights, and professional formatting
- **Executive Dashboards** - High-level summaries perfect for management presentations
- **Historical Analysis** - Trend reports comparing current vs. historical performance
- **Detailed Breakdowns** - In-depth analysis of amount distributions and status patterns

#### 📚 Historical Data Management
- **Automatic Persistence** - All reconciliation sessions automatically saved locally
- **Time Range Filtering** - Analyze data across 7 days, 30 days, 90 days, or all time
- **Performance Metrics** - Track average processing times, match rates, and volumes
- **Data Export/Import** - Backup and restore historical reconciliation data
- **Storage Management** - Monitor local storage usage with cleanup options

### 🔍 How Analytics Works

1. **Automatic Data Collection**
   - Every reconciliation session is automatically saved to browser local storage
   - Performance metrics (processing time, match rates) are tracked
   - Historical trends are calculated across multiple sessions

2. **Intelligent Analysis**
   - Smart algorithms analyze patterns in transaction data
   - Anomaly detection identifies unusual match rate deviations (>10% threshold)
   - Historical comparisons provide context for current performance

3. **Interactive Dashboard**
   - Access via "View Advanced Analytics" button after any reconciliation
   - Real-time chart interactions with hover details and legends
   - Time range filters to focus analysis on specific periods

4. **Professional Export**
   - One-click PDF generation with comprehensive analytics
   - Charts are captured as high-resolution images
   - Executive summaries and detailed breakdowns included

### 🎯 Analytics Benefits

✅ **Business Intelligence** - Transform raw data into actionable insights  
✅ **Trend Identification** - Spot patterns and anomalies early  
✅ **Performance Tracking** - Monitor reconciliation efficiency over time  
✅ **Executive Reporting** - Professional reports for stakeholder communication  
✅ **Data-Driven Decisions** - Evidence-based process improvements  
✅ **Historical Context** - Understand performance trends and variations  

### 📊 Analytics Workflow

1. **Run Reconciliation** - Process single files or batches as usual
2. **Access Analytics** - Click "View Advanced Analytics" button
3. **Explore Insights** - Review automated insights and recommendations
4. **Analyze Charts** - Interact with visualizations and trends
5. **Adjust Timeframes** - Filter data by 7d/30d/90d/all periods
6. **Export Reports** - Generate professional PDF reports
7. **Track Progress** - Monitor improvements over multiple sessions

### 🛠️ Analytics Technology Stack

- **Data Visualization**: Chart.js with React Chart.js 2
- **PDF Generation**: jsPDF with html2canvas for chart capture
- **Date Processing**: date-fns for robust date manipulation
- **Local Storage**: Browser localStorage with JSON serialization
- **Analytics Engine**: Custom algorithms for insight generation
- **TypeScript**: Full type safety for analytics data structures

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with ES2020+ support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-reconciliation-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Using the Tool

1. **Prepare your CSV files** with the following requirements:
   - Must contain a `transaction_reference` column
   - Recommended columns: `amount`, `status`, `date`, `description`
   - UTF-8 encoding
   - Headers in the first row

2. **Upload files**:
   - Upload your internal system export
   - Upload your provider statement

3. **Run reconciliation** and review results

4. **Export reports** for further analysis

## 🧪 Testing with Sample Data

The `test-data/` directory contains comprehensive CSV files for various testing scenarios:

- **Basic Test Files:**
  - `internal-system.csv` - 8 sample internal transactions
  - `provider-statement.csv` - 7 sample provider transactions
- **Extended Datasets:**
  - `large-internal-system.csv` - 55 transactions for extended testing
  - `large-provider-statement.csv` - 50 transactions with varied scenarios
- **Edge Case Files:**
  - `edge-case-internal.csv` - Edge cases with 27 transactions
  - `edge-case-provider.csv` - Edge cases with 31 transactions
- **Error Testing Files:**
  - `invalid-missing-columns.csv` - Test for invalid columns
  - `empty-file.csv` - Empty dataset
- **Performance Test Files:**
  - `performance-test-internal.csv` - Structured data for performance testing
  - `generate-large-dataset.ps1` - PowerShell script for generating large data

### Testing Scenarios

#### Single File Mode Testing
1. **Basic Functionality**: Use `internal-system.csv` and `provider-statement.csv`
2. **Large Dataset Testing**: Use the large CSV files to test pagination and performance
3. **Edge Case Testing**: Use edge-case files to test various data formats
4. **Error Handling**: Use invalid files to test error handling
5. **Performance Testing**: Use the PowerShell script to generate large datasets

#### Batch Processing Mode Testing
6. **Multi-File Upload**: Test uploading multiple files in each category
7. **File Pairing**: Create various file pair combinations and test validation
8. **Batch Processing**: Process multiple pairs simultaneously
9. **Progress Tracking**: Monitor real-time progress during batch operations
10. **Aggregate Reporting**: Verify combined statistics across multiple pairs
11. **Bulk Export**: Test comprehensive export functionality
12. **Error Recovery**: Test batch processing with some failing pairs
13. **Large Batch Operations**: Process numerous file pairs for performance testing

#### Advanced Analytics Testing
14. **Historical Data Generation**: Run multiple reconciliations to build historical trends
15. **Analytics Dashboard**: Test "View Advanced Analytics" button and dashboard functionality
16. **Chart Interactions**: Hover over charts, test time range filters (7d/30d/90d/all)
17. **Insight Generation**: Verify automated insights appear for different scenarios
18. **PDF Export**: Test comprehensive analytics PDF report generation
19. **Storage Management**: Test data export/import and storage statistics
20. **Performance Analytics**: Monitor processing time tracking and performance metrics
21. **Anomaly Detection**: Create scenarios with unusual match rates to test alerts

## 📊 CSV File Requirements

### Required Columns
- `transaction_reference` - Unique identifier for matching (required)

### Recommended Columns
- `amount` - Transaction amount (numeric)
- `status` - Transaction status (e.g., completed, pending, failed)
- `date` - Transaction date
- `description` - Transaction description

### Example CSV Format
```csv
transaction_reference,amount,status,date,description
TXN001,100.50,completed,2024-01-15,Payment for Order #1234
TXN002,250.00,pending,2024-01-15,Subscription renewal
TXN003,75.25,failed,2024-01-16,Refund request
```

## 🔒 Security & Privacy

- **Local processing**: All data processing happens in your browser
- **No data transmission**: Files are never uploaded to external servers
- **No data storage**: No data is stored or cached after processing
- **Client-side only**: Maximum data security and privacy

## ⚠️ Limitations

- **Client-side only**: No server-side processing or data persistence
- **File size limit**: 10MB maximum per file (~50,000 transactions)
- **CSV format only**: Does not support Excel, JSON, or other formats
- **Exact matching**: Uses exact reference matching (no fuzzy matching)
- **Browser memory**: Large files may impact browser performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:
1. Check the [documentation](docs/)
2. Review the [test data examples](test-data/)
3. Open an issue on GitHub
4. Contact the development team

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
