const fs = require('fs');
const https = require('https');

const auth = Buffer.from('735145446791451:ho9QXa_SsNgRUj9dc_wcuwTpIVs').toString('base64');

const postData = JSON.stringify({
  expression: "folder:wildlife_app AND resource_type:image",
  max_results: 500
});

const options = {
  hostname: 'api.cloudinary.com',
  path: '/v1_1/x1ekanir/resources/search',
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + auth,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      const resources = data.resources || [];
      console.log(`\n🎉 Found EXACT ${resources.length} Cloudinary images in wildlife_app folder!\n`);

      if (resources.length > 0) {
        // Map exact URLs into static data files
        const targetFiles = ['./src/data/animals.js', './src/data/animals.mjs', './src/data/wildlifeSeed.js'];
        
        targetFiles.forEach((filePath) => {
          if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            let idx = 0;
            
            content = content.replace(/image:\s*['"`][^'"`]*['"`]/g, () => {
              const exactUrl = resources[idx % resources.length].secure_url;
              idx++;
              return `image: "${exactUrl}"`;
            });

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Patched exact Cloudinary URLs into ${filePath}`);
          }
        });

        // Patch Animals.jsx UI component to cleanly render animal.image
        const pagePath = './src/pages/Animals.jsx';
        if (fs.existsSync(pagePath)) {
          let pageContent = fs.readFileSync(pagePath, 'utf8');

          pageContent = pageContent.replace(
            /<span[^>]*>\{animal\.emoji\}<\/span>/g,
            `<img src={animal.image} className="w-full h-44 object-cover rounded-t-xl" alt={animal.name} />`
          );

          pageContent = pageContent.replace(
            /\{animal\.emoji\}/g,
            `<img src={animal.image} className="w-full h-44 object-cover rounded-t-xl" alt={animal.name} />`
          );

          fs.writeFileSync(pagePath, pageContent, 'utf8');
          console.log(`✅ Patched Animals.jsx component UI!`);
        }
      } else {
        console.log("No resources found under wildlife_app using Search API.");
      }
    } catch (e) {
      console.error("Error parsing API response:", e);
    }
  });
});

req.on('error', (e) => console.error('Request Error:', e));
req.write(postData);
req.end();
