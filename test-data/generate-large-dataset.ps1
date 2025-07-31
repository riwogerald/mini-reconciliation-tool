# PowerShell script to generate large test datasets for performance testing
param(
    [int]$NumTransactions = 1000,
    [string]$OutputFile = "large-performance-test.csv"
)

Write-Host "Generating $NumTransactions transactions for performance testing..."

$statuses = @("completed", "pending", "failed", "processing", "cancelled")
$descriptions = @(
    "E-commerce purchase",
    "Subscription payment",
    "Refund processing",
    "Service charge",
    "API usage fee",
    "Monthly billing",
    "One-time payment",
    "Bulk transaction",
    "Corporate purchase",
    "Premium upgrade",
    "Data storage fee",
    "License renewal",
    "Support plan payment",
    "Integration fee",
    "Compliance charge"
)

$csv = "transaction_reference,amount,status,date,description`n"

for ($i = 1; $i -le $NumTransactions; $i++) {
    $txnId = "TXN{0:D6}" -f $i
    $amount = [math]::Round((Get-Random -Minimum 1 -Maximum 10000) + (Get-Random) * 0.99, 2)
    $status = $statuses | Get-Random
    $dayOffset = Get-Random -Minimum 0 -Maximum 90
    $date = (Get-Date).AddDays(-$dayOffset).ToString("yyyy-MM-dd")
    $description = ($descriptions | Get-Random) + " $i"
    
    $csv += "$txnId,$amount,$status,$date,$description`n"
    
    if ($i % 100 -eq 0) {
        Write-Host "Generated $i transactions..."
    }
}

$csv | Out-File -FilePath $OutputFile -Encoding UTF8
Write-Host "Successfully generated $OutputFile with $NumTransactions transactions"
Write-Host "File size: $([math]::Round((Get-Item $OutputFile).Length / 1KB, 2)) KB"
