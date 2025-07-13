#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the SVG content
const svgPath = path.join(__dirname, '..', 'public', 'app-icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple HTML file that generates the icons
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
</head>
<body>
    <div id="icons"></div>
    <script>
        const svgContent = \`${svgContent}\`;
        const sizes = ${JSON.stringify(iconSizes)};
        const iconsDiv = document.getElementById('icons');
        
        sizes.forEach(size => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            
            const ctx = canvas.getContext('2d');
            const img = new Image();
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = function() {
                ctx.drawImage(img, 0, 0, size, size);
                URL.revokeObjectURL(url);
                
                // Convert to blob and create download
                canvas.toBlob(function(blob) {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = size === 512 ? 'icon.png' : \`icon-\${size}x\${size}.png\`;
                    link.textContent = \`Download \${size}x\${size}\`;
                    link.style.display = 'block';
                    link.style.margin = '10px';
                    iconsDiv.appendChild(link);
                    
                    // Auto-click to download
                    setTimeout(() => link.click(), 100);
                });
            };
            
            img.src = url;
        });
    </script>
</body>
</html>`;

// Write the HTML file
const htmlPath = path.join(__dirname, 'icon-generator.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ Generated icon-generator.html');
console.log('📝 Open scripts/icon-generator.html in your browser to download all PWA icons');
console.log('💾 Save the downloaded icons to the public/ directory');
console.log('');
console.log('Required icons:');
iconSizes.forEach(size => {
    const filename = size === 512 ? 'icon.png' : `icon-${size}x${size}.png`;
    console.log(`   - ${filename}`);
});
