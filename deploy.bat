@echo off
echo Starting deployment process...

REM Step 1: Install dependencies if needed
echo Checking dependencies...
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)
if not exist "functions\node_modules" (
  echo Installing functions dependencies...
  cd functions
  call npm install
  cd ..
)

REM Step 2: Build the project
echo Building project...
call npm run build

REM Step 3: Update Firebase functions
echo Building Firebase functions...
cd functions
call npm run build
cd ..

REM Step 4: Deploy to Firebase
echo Deploying to Firebase...
call firebase deploy

REM Check if deployment was successful
if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✓ Deployment completed successfully!
  echo Your authentication pages and Firebase setup should now be live.
  echo Visit your Firebase hosting URL to see the changes.
) else (
  echo.
  echo ✗ Deployment failed. Please check the error messages above.
  echo If you encounter ESLint errors, try running:
  echo cd functions ^&^& npm run lint -- --fix
)

pause 