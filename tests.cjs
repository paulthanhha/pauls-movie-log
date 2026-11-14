const fs=require('fs'),vm=require('vm'),{webcrypto}=require('crypto');
const dummy={querySelector:()=>dummy,querySelectorAll:()=>[],classList:{toggle(){},add(){},remove(){}},style:{},dataset:{},addEventListener(){},value:'',textContent:'',innerHTML:''};
const storage=new Map();const c={console,structuredClone,TextEncoder,TextDecoder,Blob,Uint8Array,DataView,Map,Set,Intl,Date,JSON,Math,Number,String,Array,Object,RegExp,Error,crypto:webcrypto,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:dummy,location:{hash:''},window:{addEventListener(){},scrollTo(){}},setTimeout:()=>0,clearTimeout(){},atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),confirm:()=>true};
vm.createContext(c);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),c);vm.runInContext(`
const example=normalize({id:'test-film',title:'Phim tiếng Việt <script>',genres:['Drama'],ratings:{story:3,visuals:4,performances:3,impact:3},watches:[{date:'2026-11-11',venue:'Ở nhà'}],review:'Một đoạn cảm nhận.\\n\\n**Giữ Markdown**',poster:'assets/posters/test-film.webp'});
const md=toMd(example);const roundtrip=parseMd(md);
if(JSON.stringify(example)!==JSON.stringify(roundtrip))throw Error('Markdown roundtrip failed');
if(scoreText(example)!=='3.3')throw Error('Mean rounding failed');
if(score(normalize({id:'partial',title:'Partial',ratings:{story:5}}))!==null)throw Error('Partial must be unrated');
if(scoreText(normalize({id:'zero',title:'Zero',ratings:{story:0,visuals:0,performances:0,impact:0}}))!=='0')throw Error('Zero is valid');
if(safeImage('javascript:alert(1)')!=='')throw Error('Unsafe image URL');
if(esc('<script>')!=='&lt;script&gt;')throw Error('Escaping failed');
let rejected=false;try{parseMd('---\\nid: "../escape"\\ntitle: "Bad"\\n---\\n')}catch{rejected=true}if(!rejected)throw Error('Path traversal not rejected');
if(!persist([example]))throw Error('Persistence failed');
if(JSON.parse(localStorage.getItem(KEY))[0].title!==example.title)throw Error('Stored data mismatch');
globalThis.testZip=zip([['content/films/test-film.md',bytes(md)],['assets/posters/test-film.webp',new Uint8Array([1,2,3])]]);
`,c);
(async()=>{fs.writeFileSync('/workspace/scratch/e7615589a4b9/afterglow-test.zip',Buffer.from(await c.testZip.arrayBuffer()));console.log('PASS: Markdown roundtrip, scores, null/zero, safe URLs, escaping, paths, persistence, ZIP')})();
(async()=>{
 const calls=[];
 c.fetch=async(url,opts)=>{calls.push({url,opts});return{ok:true,status:200,json:async()=>({sha:'old-sha',content:Buffer.from('hello').toString('base64')})}};
 await vm.runInContext(`(async()=>{prefs={repo:'owner/repo',branch:'main',folder:'content/films'};token='test-only';await gh('contents/content/films/test.md');let detected=false;try{await putFile('content/films/test.md',bytes('data'),'test','different-sha')}catch(e){detected=e.message.includes('thay đổi')}if(!detected)throw Error('Missing conflict protection');})()`,c);
 if(calls[0].opts.headers.Authorization!=='Bearer test-only')throw Error('Auth missing');
 if([...storage.values()].some(v=>v.includes('test-only')))throw Error('Token persisted');
 console.log('PASS: GitHub request authentication, conflict detection, token not persisted');
})().catch(e=>{console.error(e);process.exitCode=1});
vm.runInContext(`
for(const [value,color] of [[1,'#EF4444'],[2,'#F97316'],[3,'#F59E0B'],[4,'#10B981'],[5,'#0088FF'],[3.49,'#F59E0B'],[3.5,'#10B981'],[4.5,'#0088FF']])if(ratingColor(value)!==color)throw Error('Wrong color for '+value);
for(const [value,label] of [[1,'Flop'],[2,'Barely Watchable'],[3,'Entertaining'],[4,'Worth-watching'],[5,'Cinematic Gem']]){const f=normalize({id:'rating-test',title:'Rating',ratings:{story:value,visuals:value,performances:value,impact:value}});if(badge(f)!==label)throw Error('Wrong label for '+value)}
if(ratingColor(null)!=='#a6afb8')throw Error('Unrated color mismatch');
const canonical=canonicalGenres([' drama ','DRAMA','Sci-fi','sci-fi',' My  Tag ','my tag']);if(JSON.stringify(canonical)!==JSON.stringify(['Drama','Sci-fi','My Tag']))throw Error('Tag deduplication failed');
`,c);
console.log('PASS: five colors and labels, mean rounding boundaries, unrated color, tag deduplication');
vm.runInContext(`
if(reviewComment({review:'   \\n'})!=='')throw Error('Empty review must be invisible');
const authored=normalize({id:'author-test',title:'Movie',review:'A <script> review',reviewer:{name:'My <persona>',avatar:'https://example.com/avatar.webp'},ratings:{story:5,visuals:5,performances:5,impact:5}});
if(!reviewComment(authored).includes('Reviewed By')||reviewComment(authored).includes('A <script>'))throw Error('Comment layout or escaping failed');
const authorRoundtrip=parseMd(toMd(authored));if(authorRoundtrip.reviewer.name!==authored.reviewer.name||authorRoundtrip.reviewer.avatar!==authored.reviewer.avatar)throw Error('Author metadata roundtrip failed');
if(normalizeReviewer({avatar:'javascript:alert(1)'}).avatar!=='')throw Error('Unsafe avatar accepted');
if(reviewComment({...authored,spoilers:true}).includes('A &lt;script&gt; review'))throw Error('Spoiler leaked');
reviewerProfile={name:'App character',avatar:'data:image/webp;base64,AQID',configured:true};
const overridden=parseMd(toMd(authored));if(overridden.reviewer.name!=='App character'||overridden.reviewer.avatar!=='data:image/webp;base64,AQID')throw Error('App persona export failed');
if(!reviewComment(authored).includes('App character'))throw Error('App persona not displayed');
`,c);
console.log('PASS: optional comments, author markup and escaping, spoiler gate, safe avatar, persona Markdown roundtrip');
vm.runInContext(`
const cFilm=(id,points,watches,genres=['Drama'])=>normalize({id,title:id,genres,ratings:points===null?{}:{story:points,visuals:points,performances:points,impact:points},watches:watches.map(date=>({date,venue:''}))});
const collectionFixture=[cFilm('flop-film',1,['2025-01-10','2026-02-10','2026-02-20']),cFilm('gem-film',5,['2026-01-20']),cFilm('unrated-film',null,[])];
const jan2026=collectionRecords(collectionFixture,{month:'1',year:'2026'});if(jan2026.length!==1||jan2026[0].film.id!=='gem-film')throw Error('Date filters combined different viewing dates');
const january=collectionRecords(collectionFixture,{month:'1'});if(january.length!==2||january.find(r=>r.film.id==='flop-film').date!=='2025-01-10')throw Error('Matching viewing date selection failed');
const allRecords=collectionRecords(collectionFixture);const byMonth=collectionGroups(allRecords,'month');if(JSON.stringify(byMonth.map(g=>g.key))!==JSON.stringify(['2026-02','2026-01','undated']))throw Error('Month ordering/undated grouping failed');
if(byMonth.flatMap(g=>g.records).length!==3||allRecords.find(r=>r.film.id==='flop-film').date!=='2026-02-20')throw Error('Rewatch deduplication failed');
const byRank=collectionGroups(allRecords,'rank');if(JSON.stringify(byRank.map(g=>g.label))!==JSON.stringify(['Cinematic Gem','Flop','Chưa chấm đủ']))throw Error('Rank ordering/unrated grouping failed');
if(collectionRecords(collectionFixture,{unrated:true,year:'2026'}).length!==0)throw Error('Undated films should not match year filter');
if(collectionRecords(collectionFixture,{search:'gem',genre:'Drama',month:'1',year:'2026'}).length!==1)throw Error('Combined collection filters failed');
if(collectionGroups(allRecords,'none').length!==1)throw Error('Ungrouped mode failed');
`,c);
console.log('PASS: watched month/year filters, combined filters, rewatch date selection and deduplication, month/rank ordering, unrated groups');
vm.runInContext(`
const mixedRecords=[...allRecords,...collectionRecords([cFilm('four-in-feb',4,['2026-02-01'])])];
const febGroup=collectionGroups(mixedRecords,'month')[0];if(JSON.stringify(febGroup.records.map(r=>score(r.film)))!==JSON.stringify([4,1]))throw Error('Month group should sort highest score first');
const fullDemoRecords=collectionRecords(DEMOS),demoLevels=[...new Set(fullDemoRecords.map(r=>ratingLevel(score(r.film))))].sort();if(JSON.stringify(demoLevels)!==JSON.stringify([1,2,3,4,5]))throw Error('Demo pack must cover all five ranks');
if(JSON.stringify(collectionGroups(fullDemoRecords,'rank').map(g=>g.key))!==JSON.stringify(['5','4','3','2','1']))throw Error('Descending five-rank order failed');
const beforeDemoTest=films,previousMarker=localStorage.getItem(DEMO_RANK_PACK_KEY);films=[normalize({...DEMO_RANK_EXTRAS[0],title:'Edited sample'})];localStorage.setItem(DEMO_RANK_PACK_KEY,'1');if(seedRankDemos()!==0)throw Error('Demo pack should seed only once');const restored=seedRankDemos(true);if(restored!==4||films.find(f=>f.id==='demo-last-signal').title!=='Edited sample')throw Error('Restore must add missing demos without overwriting');films=[];if(seedRankDemos()!==0)throw Error('Deleted demos should not silently return');films=beforeDemoTest;localStorage.setItem(DEMO_RANK_PACK_KEY,previousMarker||'1');
`,c);
console.log('PASS: descending score within month, all five demo ranks, seed-once and restore without overwriting edits');
vm.runInContext(`
const effectMarkup=[1,2,3,4,5].map(rankEffectMarkup);
if(effectMarkup.slice(0,3).some(Boolean)||!effectMarkup[3].includes('rank-art-4')||!effectMarkup[4].includes('rank-art-5'))throw Error('Only the top two ranks retain star artwork');
if(rankEffectMarkup(null)!==''||rankEffectMarkup(0)!=='')throw Error('Unrated items must not express satisfaction');
`,c);
console.log('PASS: only the top two ranks retain stars, lower ranks and unrated have no symbols');
