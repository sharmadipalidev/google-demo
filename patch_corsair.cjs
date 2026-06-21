const fs = require('fs');
let code = fs.readFileSync('node_modules/corsair/dist/chunk-LIZVHWQK.js', 'utf8');
code = code.replace(
  /let w=Q\(k,m\);await d\.updateIntegration\(\{config:w\}\)/g,
  'let w=Q(k,m); console.log("UPDATING DB WITH:", w); await d.updateIntegration({config:w})'
);
fs.writeFileSync('node_modules/corsair/dist/chunk-LIZVHWQK.js', code);
