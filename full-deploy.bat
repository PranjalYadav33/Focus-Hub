@echo off
echo 🎯 Memphis Focus Hub - Complete GitHub Deployment
echo ================================================

echo.
echo Step 1: Checking Git status...
git status

echo.
echo Step 2: Adding all files to Git...
git add .

echo.
echo Step 3: Committing changes...
git commit -m "feat: Memphis Focus Hub - deployment ready"

echo.
echo Step 4: Pushing to GitHub main branch...
git push origin main

echo.
echo Step 5: Installing dependencies...
call npm install

echo.
echo Step 6: Building the project...
call npm run build

echo.
echo Step 7: Deploying to GitHub Pages...
call npm run deploy

echo.
echo ✅ Deployment Complete!
echo.
echo 📝 Final Steps:
echo 1. Go to: https://github.com/PrnjalYadav33/memphis-focus-hub
echo 2. Click Settings → Pages
echo 3. Set Source to 'gh-pages' branch
echo 4. Wait 2-5 minutes
echo 5. Visit: https://PrnjalYadav33.github.io/memphis-focus-hub/
echo.
echo 🎉 Your Memphis Focus Hub should be live!
echo.
pause
