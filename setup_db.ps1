$ErrorActionPreference = "Stop"
try {
    & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "SELECT version()"
    Write-Host "Connection test succeeded"
} catch {
    Write-Host "Error: $_"
}