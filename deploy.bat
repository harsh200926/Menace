@echo off
echo Starting deployment process...

REM Step 1: Install dependencies if needed
echo Checking dependencies...
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)

REM Step 2: Clean build directory to ensure fresh build
echo Cleaning build directory...
if exist "dist" (
  rmdir /s /q "dist"
)

REM Step 3: Build the project with production settings
echo Building project with production settings...
call npm run build

REM Check if build was successful
if not exist "dist" (
  echo.
  echo ✗ Build failed. Please check the error messages above.
  pause
  exit /b 1
)

REM Step 4: Ensure routing is properly configured for single-page app
echo Adding proper routing configuration for SPA...
echo ^<^!DOCTYPE html^>^<html^>^<head^>^<meta charset="utf-8"^>^<title^>MENACE^</title^>^<script^>sessionStorage.redirect = location.href;^</script^>^<meta http-equiv="refresh" content="0;URL='/'^^"^>^</head^>^<body^>^</body^>^</html^> > dist/404.html

REM Add script to index.html to handle redirects
powershell -Command "(Get-Content dist/index.html) -replace '</head>', '<script>if (sessionStorage.redirect) { const redirect = sessionStorage.redirect; delete sessionStorage.redirect; if (redirect !== location.href) { history.replaceState(null, null, redirect); }}</script></head>' | Set-Content dist/index.html"

REM Step 5: Deploy to Firebase (excluding storage and functions)
echo Deploying to Firebase (skipping storage and functions)...
call firebase deploy --except "storage,functions"

REM Check if deployment was successful
if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✓ Deployment completed successfully!
  echo Your application should now be live.
  echo Visit your Firebase hosting URL to see the changes.
) else (
  echo.
  echo ✗ Deployment failed. Please check the error messages above.
)

pause 