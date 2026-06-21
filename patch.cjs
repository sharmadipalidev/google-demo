const fs = require('fs');
let code = fs.readFileSync('node_modules/corsair/dist/chunk-LIZVHWQK.js', 'utf8');
code = code.replace(/k=async\(\)=>\{let y=await p\.getIntegration\(\),h=await m\(\),P=y\.config;return!P\|\|Object\.keys\(P\)\.length===0\?\{\}:U\(P,h\)\}/g, "k=async()=>{let y=await p.getIntegration(); console.log('GET_INTEGRATION Y:', y); let h=await m(),P=y.config; console.log('CONFIG BEFORE DEC:', P); let res = !P||Object.keys(P).length===0?{}:U(P,h); console.log('DEC RES:', await res); return await res;}");
fs.writeFileSync('node_modules/corsair/dist/chunk-LIZVHWQK.js', code);
