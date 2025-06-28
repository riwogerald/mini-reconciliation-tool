# Testing the Mini Reconciliation Tool

## Test Files Created

### 1. internal-system.csv
- Contains 8 transactions from your internal system
- Includes: TXN001-TXN008

### 2. provider-statement.csv  
- Contains 7 transactions from the payment provider
- Includes: TXN001, TXN002, TXN004, TXN006, TXN007, TXN009, TXN010

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

### Step 6: Test Edge Cases
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