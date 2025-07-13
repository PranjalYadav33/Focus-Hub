@echo off
echo 🎯 Memphis Focus Hub - Manual Deployment
echo ========================================

echo.
echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building the project...
call npm run build

echo.
echo Step 3: Deploying to GitHub Pages...
call npx gh-pages -d dist

echo.
echo ✅ Deployment complete!
echo.
echo 📝 Next steps:
echo 1. Go to your GitHub repository settings
echo 2. Navigate to Pages section
echo 3. Set source to 'gh-pages' branch
echo 4. Wait 2-5 minutes for deployment
echo 5. Visit: https://PrnjalYadav33.github.io/memphis-focus-hub/
echo.
pause
