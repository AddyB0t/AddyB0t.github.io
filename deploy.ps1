# Hugo GitHub Pages Deployment Script

# Build the site
Write-Host "Building site with Hugo..." -ForegroundColor Green
C:\Users\Admin\AppData\Local\Microsoft\WinGet\Packages\Hugo.Hugo.Extended_Microsoft.Winget.Source_8wekyb3d8bbwe\hugo.exe --minify

# Switch to gh-pages branch
Write-Host "Preparing gh-pages branch..." -ForegroundColor Green
git checkout gh-pages

# Remove the old files (except .git directory and public folder)
Get-ChildItem -Exclude .git,public,deploy.ps1 | Remove-Item -Recurse -Force

# Copy contents from public to root
Write-Host "Copying public folder contents to root..." -ForegroundColor Green
Get-ChildItem -Path public | Copy-Item -Destination . -Recurse -Force

# Add CNAME file if needed
# Set-Content -Path CNAME -Value "yourdomain.com"

# Remove the public directory
Write-Host "Cleaning up..." -ForegroundColor Green
Remove-Item -Path public -Recurse -Force

# Add all files
Write-Host "Committing changes..." -ForegroundColor Green
git add .

# Commit changes
git commit -m "Deploy site to GitHub Pages"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push origin gh-pages --force

# Switch back to main branch
Write-Host "Switching back to main branch..." -ForegroundColor Green
git checkout main

Write-Host "Deployment complete!" -ForegroundColor Green 