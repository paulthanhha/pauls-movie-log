const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'_site');
const {parseMd}=require('./model.cjs')();
function localAsset(src){return typeof src==='string'&&/^\/?assets\//.test(src)}
function checkAsset(src){if(!localAsset(src))return;const file=src.replace(/^\//,'');if(file.split('/').some(p=>p==='..'||!p))throw Error('Unsafe asset path: '+file);if(!fs.existsSync(path.join(out,file)))throw Error('Missing image: '+file)}
fs.rmSync(out,{recursive:true,force:true});fs.cpSync(path.join(root,'dist'),out,{recursive:true});
if(fs.existsSync(path.join(root,'assets')))fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
const content=path.join(root,'content/films'),films=[],ids=new Set();
for(const file of fs.readdirSync(content).filter(n=>n.endsWith('.md')).sort()){
 const film=parseMd(fs.readFileSync(path.join(content,file),'utf8'));
 if(file!==film.id+'.md'||ids.has(film.id))throw Error('Duplicate ID or filename mismatch: '+file);
 ids.add(film.id);checkAsset(film.poster);checkAsset(film.reviewer?.avatar);films.push(film);
}
fs.cpSync(path.join(root,'content'),path.join(out,'content'),{recursive:true});
const data=JSON.stringify({schemaVersion:1,films}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
fs.writeFileSync(path.join(out,'data.js'),'window.MOVIE_LOG_BOOTSTRAP='+data+';\n');
// Fingerprint script and stylesheet URLs so a new HTML never reuses old UI code.
const fingerprint=file=>createHash('sha256').update(fs.readFileSync(path.join(out,file))).digest('hex').slice(0,12);
const htmlPath=path.join(out,'index.html');
const html=fs.readFileSync(htmlPath,'utf8').replace(/(src|href)="(\.\/(?:style\.css|app\.js|import\.js|share\.js|data\.js))"/g,(_,attr,url)=>`${attr}="${url}?v=${fingerprint(url.slice(2))}"`);
fs.writeFileSync(htmlPath,html);
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Built GitHub Pages: '+films.length+' Markdown films → _site/');
