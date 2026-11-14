// Reuse the app's Markdown validation and schema without a second parser.
const fs=require('node:fs'),vm=require('node:vm'),{webcrypto}=require('node:crypto');
module.exports=function model(options={}){
 const dummy={querySelector:()=>dummy,querySelectorAll:()=>[],classList:{toggle(){},add(){},remove(){}},style:{},dataset:{},addEventListener(){},value:'',textContent:'',innerHTML:''};
 const storage=new Map(),c={fetch:options.fetch,console,structuredClone,TextEncoder,TextDecoder,Blob,Uint8Array,DataView,Map,Set,Intl,Date,JSON,Math,Number,String,Array,Object,RegExp,Error,crypto:webcrypto,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:dummy,location:{hash:''},window:{addEventListener(){},scrollTo(){}},setTimeout:()=>0,clearTimeout(){},atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),confirm:options.confirm||(()=>true)};
 vm.createContext(c);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/app.js'),'utf8'),c);
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/import.js'),'utf8'),c);
 if(options.setup)vm.runInContext(options.setup,c);
 return vm.runInContext('({deleteFilm,getFilms:()=>films,syncAll,parseImportText,validateImportBatch,planImport,parseCsvRows,verifyOwnerToken,gh,parseMd,toMd,normalize,DEMOS,mergePublished,assetUrl,loadFilmState})',c);
};
