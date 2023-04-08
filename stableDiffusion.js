const uniqid = require('uniqid');
const http = require('node:http');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const artMaker = async ({features, items, colors, occupations, characteristics}, name) => {
  const id = uniqid();
  const postData = JSON.stringify({
    "enable_hr": false,
    "prompt": `(masterpiece, painting), ((goblin_${colors})), solo, ((${features.join(", ")}))+++, ((${items.join(", ")}))+++, ((${colors}))+++, (${occupations}), ((${characteristics}))+++, creature, dark_fantasy, weird, mystical, strange, deformed, concept_art`,
    "steps": 20,
    "negative_prompt": "(low quality, worst quality:1.4), female, tits, nipples, extra digit, fewer digits, NSFW, multiple_goblins, multiple_creatures",
    "width": 512,
    "height": 512,
    "cfg_scale": 12
  });
  console.log(`(masterpiece, painting), goblin_${colors}, ((${features.join(", ")}))+++, (${items.join(", ")}), ${colors}, ${occupations}, ${characteristics}`);
  const options = {
    hostname: '127.0.0.1',
    port: 7860,
    path: '/sdapi/v1/txt2img',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  };

  // Wrap the request code in a Promise
  const makeRequest = () => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          makeImage(JSON.parse(responseData));
          resolve(id); // Resolve the Promise with the generated ID
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        reject(e); // Reject the Promise with the error
      });

      // Write data to request body
      req.write(postData);
      req.end();
    });
  };

  const makeImage = async (r) => {
      for (const i of r['images']) {
          const data = i.split(',', 1)[0];
          const buffer = Buffer.from(data, 'base64');
          const canvas = createCanvas(512, 512); 
          const ctx = canvas.getContext('2d');
          const img = await loadImage(buffer);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          fs.writeFileSync(`./goblin_images/${name}${id}.jpg`, canvas.toBuffer('image/jpeg'));
      }
  };

  // Call the Promise wrapper and await the result
  const result = await makeRequest();
  return result;
};

module.exports = artMaker;