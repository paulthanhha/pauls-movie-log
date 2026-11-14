const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const out=path.resolve(__dirname,'../_site'),html=fs.readFileSync(path.join(out,'index.html'),'utf8');
const files=new Set();for(const match of html.matchAll(/(?:src|href)="\.\/([^"?]+)\?v=([a-f0-9]{12})"/g)){const file=match[1];files.add(file);const expected=createHash('sha256').update(fs.readFileSync(path.join(out,file))).digest('hex').slice(0,12);assert.equal(match[2],expected,'Version must match deployed bytes: '+file)}
for(const file of ['style.css','data.js','app.js','import.js','share.js'])assert(files.has(file),'Missing fingerprinted asset: '+file);
console.log('PASS: published asset URLs match the generated CSS/JavaScript bytes');
