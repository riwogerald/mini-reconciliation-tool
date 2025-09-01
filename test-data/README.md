# Testing the Mini Reconciliation Tool

## Test Files Overview

This directory contains comprehensive test data for validating the Mini Reconciliation Tool across various scenarios.

## Supported File Formats

The Mini Reconciliation Tool now supports multiple file formats:

- **CSV** (.csv) - Comma-Separated Values
- **TSV** (.tsv, .tab) - Tab-Separated Values  
- **Excel** (.xlsx, .xls) - Microsoft Excel Spreadsheets
- **JSON** (.json) - JavaScript Object Notation

All formats must contain a `transaction_reference` column/field and can be mixed and matched (e.g., upload a CSV internal file with an Excel provider file).

## Basic Test Files

### 1. internal-system.csv
- **Purpose**: Basic functionality testing
- **Size**: 8 transactions
- **Content**: TXN001-TXN008
- **Use Case**: Initial validation of core reconciliation features

### 2. provider-statement.csv  
- **Purpose**: Basic functionality testing
- **Size**: 7 transactions  
- **Content**: TXN001, TXN002, TXN004, TXN006, TXN007, TXN009, TXN010
- **Use Case**: Partner file for basic reconciliation testing

## Extended Test Files

### 3. large-internal-system.csv
- **Purpose**: Extended functionality and UI testing
- **Size**: 55 transactions
- **Content**: TXN001-TXN055 with varied amounts, dates, and statuses
- **Use Case**: Test pagination, search, filtering, and larger dataset handling

### 4. large-provider-statement.csv
- **Purpose**: Extended functionality testing
- **Size**: 50 transactions
- **Content**: Mix of matched, mismatched, and provider-only transactions
- **Use Case**: Partner file for extended reconciliation scenarios

## Edge Case Test Files

### 5. edge-case-internal.csv
- **Purpose**: Data validation and edge case handling
- **Size**: 27 transactions
- **Content**: Various formatting issues, duplicates, empty fields
- **Use Case**: Test robustness against problematic data

### 6. edge-case-provider.csv
- **Purpose**: Mismatch detection and data normalization
- **Size**: 31 transactions
- **Content**: Various mismatches, formatting corrections
- **Use Case**: Validate mismatch detection and data handling

## Multi-Format Test Files

### 7. sample-internal.json
- **Purpose**: JSON format testing
- **Size**: 3 transactions
- **Content**: TXN-001 to TXN-003 in JSON format
- **Use Case**: Test JSON file processing and parsing

### 8. sample-provider.tsv
- **Purpose**: TSV format testing  
- **Size**: 3 transactions
- **Content**: TXN-001, TXN-002, TXN-004 in tab-separated format
- **Use Case**: Test TSV file processing and cross-format reconciliation

## Error Testing Files

### 9. invalid-missing-columns.csv
- **Purpose**: Validation error testing
- **Content**: CSV with wrong column names
- **Use Case**: Test error handling for invalid file formats

### 10. empty-file.csv
- **Purpose**: Edge case testing
- **Content**: Headers only, no data rows
- **Use Case**: Test handling of empty datasets

## Performance Test Files

### 9. performance-test-internal.csv
- **Purpose**: Basic performance testing
- **Size**: 50 transactions
- **Content**: Structured test data for performance validation
- **Use Case**: Baseline performance testing

### 10. generate-large-dataset.ps1
- **Purpose**: Dynamic large dataset generation
- **Capability**: Generate 1000+ transaction files
- **Use Case**: Custom performance and stress testing

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

## Expected Performance
- File upload should be instant for small files
- Processing should complete within 1-2 seconds
- UI should remain responsive during processing
- Export should generate downloadable CSV files