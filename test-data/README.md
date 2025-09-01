# Test Data for Mini Reconciliation Tool

## Overview

This directory contains comprehensive test data for validating the Mini Reconciliation Tool across various file formats and scenarios. The test data is organized by file format and complexity level to support thorough testing of all features.

## Supported File Formats

The Mini Reconciliation Tool supports the following file formats:

| Format | Extensions | Description |
|--------|------------|-------------|
| **CSV** | `.csv` | Comma-Separated Values |
| **Excel** | `.xlsx`, `.xls` | Microsoft Excel Spreadsheets |
| **JSON** | `.json` | JavaScript Object Notation |
| **TSV** | `.tsv`, `.tab` | Tab-Separated Values |

All formats must contain a `transaction_reference` column/field. Files can be mixed and matched (e.g., CSV internal file with Excel provider file).

## Directory Structure

```
test-data/
├── CSV Files/
│   ├── Simple/           # Basic CSV files for initial testing
│   ├── Large/            # Large datasets for performance testing
│   ├── Edge Cases/       # Files with data quality issues
│   └── Performance/      # Performance benchmarking files
├── Excel Files/
│   ├── Simple/           # Basic Excel files (.xlsx, .xls)
│   ├── Large/            # Large Excel datasets
│   └── Edge Cases/       # Excel files with formatting issues
├── JSON Files/
│   ├── Simple/           # Basic JSON transaction arrays
│   ├── Large/            # Large JSON datasets with metadata
│   └── Edge Cases/       # JSON files with nested structures
├── TSV Files/
│   ├── Simple/           # Basic tab-separated files (.tsv, .tab)
│   ├── Large/            # Large TSV datasets
│   └── Edge Cases/       # TSV files with special characters
├── generate-large-dataset.ps1  # PowerShell script for custom datasets
└── README.md             # This file
```

## File Categories

### 📄 Simple Files
Basic test files with clean data for initial validation:
- **Purpose**: Basic functionality testing
- **Size**: 5-8 transactions
- **Content**: Clean, well-formatted data
- **Use Case**: Initial validation of core features

### 📊 Large Files  
Larger datasets for performance and UI testing:
- **Purpose**: Performance and scalability testing
- **Size**: 15-55 transactions
- **Content**: Realistic transaction volumes
- **Use Case**: Test pagination, search, filtering, and performance

### ⚠️ Edge Cases
Files with data quality issues and edge cases:
- **Purpose**: Robustness and error handling testing
- **Size**: Varies
- **Content**: Missing fields, special characters, formatting issues
- **Use Case**: Validate error handling and data cleaning

### 🚀 Performance
Optimized files for benchmarking:
- **Purpose**: Performance benchmarking
- **Size**: 50+ transactions
- **Content**: Structured data for consistent performance testing
- **Use Case**: Baseline performance validation

## Test File Details

### CSV Files

#### Simple/
- `internal-system.csv` - 8 transactions (TXN001-TXN008)
- `provider-statement.csv` - 7 transactions with some matches

#### Large/
- `large-internal-system.csv` - 55 transactions with varied data
- `large-provider-statement.csv` - 50 transactions for complex reconciliation

#### Edge Cases/
- `edge-case-internal.csv` - 27 transactions with formatting issues
- `edge-case-provider.csv` - 31 transactions with mismatches
- `empty-file.csv` - Headers only, no data
- `invalid-missing-columns.csv` - Invalid column structure

#### Performance/
- `performance-test-internal.csv` - 50 structured transactions

### Excel Files

#### Simple/
- `internal-system.xlsx` - Basic Excel format with 5 transactions
- `provider-statement.xlsx` - Provider data in Excel format
- `internal-system.xls` - Legacy Excel format (.xls) support

#### Edge Cases/
- `mixed-formats.xlsx` - Mixed case headers, currency symbols, empty fields

### JSON Files

#### Simple/
- `sample-internal.json` - Basic JSON array with 3 transactions
- `provider-statement.json` - Provider data in JSON format

#### Large/
- `large-dataset.json` - 10 transactions with metadata wrapper

#### Edge Cases/
- `nested-structure.json` - JSON with nested data structure
- `invalid-references.json` - Missing/null transaction references

### TSV Files

#### Simple/
- `internal-system.tsv` - Tab-separated internal data
- `provider-statement.tab` - Provider data with .tab extension
- `sample-provider.tsv` - Basic TSV sample

#### Large/
- `large-dataset.tsv` - 15 transactions with additional columns

#### Edge Cases/
- `special-characters.tsv` - Special characters, empty fields, formatting issues

## Expected Test Results

### ✅ Matched Transactions (4 total)
- **TXN001**: Perfect match (amount: $100.50, status: completed)
- **TXN004**: Perfect match (amount: $500.00, status: completed)  
- **TXN006**: Perfect match (amount: $150.00, status: completed)

### 🔍 Matched with Mismatches (2 total)
- **TXN002**: Amount mismatch ($250.00 vs $255.00)
- **TXN007**: Status mismatch (completed vs pending)

### ⚠️ Internal File Only (3 total)
- **TXN003**: $75.25, pending - Refund request
- **TXN005**: $25.99, failed - Small item purchase  
- **TXN008**: $45.50, pending - Processing payment

### ❌ Provider File Only (2 total)
- **TXN009**: $89.99, completed - New transaction
- **TXN010**: $199.50, failed - Payment attempt

## How to Test

### Step 1: Start the Application
1. Make sure the dev server is running
2. Open the application in your browser

### Step 2: Upload Files
1. Click on the "Internal System Export" upload area
2. Select the `internal-system.csv` file
3. Click on the "Provider Statement" upload area  
4. Select the `provider-statement.csv` file

### Step 3: Run Reconciliation
1. Click the "Run Reconciliation" button
2. Wait for processing to complete

### Step 4: Verify Results
Check that the summary shows:
- **Match Rate**: ~67% (4 perfect matches out of 6 total matches from 8 internal transactions)
- **Matched Transactions**: 6 (4 perfect + 2 with mismatches)
- **Internal Only**: 3
- **Provider Only**: 2

### Step 5: Test Features
1. **Search**: Try searching for "TXN002" in the matched transactions table
2. **Export**: Click export buttons to download CSV files
3. **Pagination**: If you add more test data, verify pagination works
4. **Mismatch Highlighting**: Check that TXN002 and TXN007 show mismatches clearly

### Step 6: Test Multi-Format Support
1. **JSON Format**: Upload `sample-internal.json` as internal file
2. **TSV Format**: Upload `sample-provider.tsv` as provider file
3. **Mixed Formats**: Try combinations like Excel internal + CSV provider
4. **Format Validation**: Try uploading unsupported formats (.txt, .pdf)

### Step 7: Test Edge Cases
1. **Empty Files**: Try uploading empty CSV files
2. **Invalid Format**: Try uploading a .txt file
3. **Missing Columns**: Create a CSV without transaction_reference column
4. **Large Files**: Create files with 100+ transactions

## Creating Additional Test Data

To create more comprehensive test data:

```csv
# For testing large datasets
transaction_reference,amount,status,date,description
TXN001,100.00,completed,2024-01-01,Test transaction 1
TXN002,200.00,pending,2024-01-02,Test transaction 2
# ... add more rows
```

**Expected Match Rate**: ~67% (4 perfect matches out of 6 total matches from 8 internal transactions)

## Testing Guide

### Quick Start Test
1. Upload `CSV Files/Simple/internal-system.csv` as internal file
2. Upload `JSON Files/Simple/provider-statement.json` as provider file
3. Run reconciliation
4. Verify cross-format compatibility

### Multi-Format Testing Matrix

| Internal Format | Provider Format | Test Purpose |
|-----------------|-----------------|-------------|
| CSV | JSON | Cross-format compatibility |
| Excel | TSV | Different parsing engines |
| JSON | Excel | Complex to simple format |
| TSV | CSV | Tab vs comma separation |

### Edge Case Testing
1. **Format Validation**: Try uploading unsupported files (.txt, .pdf)
2. **Data Validation**: Use files from Edge Cases folders
3. **Performance**: Use Large folder files for volume testing
4. **Error Handling**: Use invalid-references.json and empty-file.csv

### Batch Processing Tests
1. **Mixed Formats**: Upload multiple different format files
2. **Large Volumes**: Use Large folder files for batch processing
3. **Error Recovery**: Mix valid and invalid files

## Creating Custom Test Data

### Using PowerShell Script
The included `generate-large-dataset.ps1` can create custom CSV datasets:
```powershell
.\generate-large-dataset.ps1 -Count 1000 -OutputPath "custom-large.csv"
```

### Manual File Creation
For other formats, follow these patterns:

**CSV Format:**
```csv
transaction_reference,amount,status,date,description
TXN001,100.00,completed,2024-01-01,Test transaction
```

**JSON Format:**
```json
[
  {
    "transaction_reference": "TXN001",
    "amount": 100.00,
    "status": "completed",
    "date": "2024-01-01",
    "description": "Test transaction"
  }
]
```

**TSV Format:**
```tsv
transaction_reference	amount	status	date	description
TXN001	100.00	completed	2024-01-01	Test transaction
```

## Performance Expectations

- **File Upload**: Instant for files < 1MB
- **Processing**: 1-3 seconds for files < 100 transactions
- **UI Responsiveness**: Maintained during processing
- **Export**: CSV/Excel/JSON export functionality
- **Cross-Format**: No performance penalty for mixed formats

## Troubleshooting

### Common Issues
1. **"Unsupported file format"**: Ensure file has correct extension
2. **"Missing transaction_reference"**: Check column/field naming
3. **"No valid transactions"**: Verify data in transaction_reference column
4. **Excel not loading**: Try re-saving as .xlsx format
5. **JSON parsing error**: Validate JSON structure

### File Requirements
- All formats must include `transaction_reference` column/field
- Field names are normalized (spaces → underscores, lowercase)
- Amount fields are automatically converted to numbers
- Empty transaction references are filtered out

This comprehensive test suite ensures the Mini Reconciliation Tool works reliably across all supported formats and edge cases.
