const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {mergePublished,normalize,parseMd,assetUrl,loadFilmState}=require('./scripts/model.cjs')();
const make=(title,id='movie')=>normalize({id,title,ratings:{story:4,visuals:4,performances:4,impact:4}});
const old=make('Old'),updated=make('Published update'),edited=make('My unsynced edit');
assert.equal(mergePublished([old],[old],[updated])[0].title,'Published update');
assert.equal(mergePublished([edited],[old],[updated])[0].title,'My unsynced edit');
assert.equal(mergePublished([old],[old],[]).length,0);
assert.equal(mergePublished([edited],[old],[])[0].title,'My unsynced edit');
assert.equal(mergePublished([],[old],[updated]).length,0,'Do not restore locally deleted film');
assert.equal(mergePublished([old],[],[make('New','new')]).length,2);
for(const base of ['https://example.github.io/','https://example.github.io/pauls-movie-log/']){
 const html=fs.readFileSync('dist/index.html','utf8');
 for(const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)){
  const target=new URL(match[1],base);assert(target.pathname.startsWith(new URL(base).pathname));
  assert(fs.existsSync(path.join('dist',match[1])),'Missing linked file '+match[1]);
 }
 assert.equal(new URL(assetUrl('/assets/godzilla.webp'),base).href,base+'assets/godzilla.webp');
}
for(const file of fs.readdirSync('content/films').filter(f=>f.endsWith('.md'))){const film=parseMd(fs.readFileSync('content/films/'+file,'utf8'));assert.equal(file,film.id+'.md')}
assert(!/url\(['"]?\/assets\//.test(fs.readFileSync('dist/style.css','utf8')),'Fonts must support repo subpaths');
console.log('PASS: Pages root/subpath links, Markdown records, published updates/deletions preserve unsynced edits');

const key='afterglow.films.v1',snapshotKey='pauls-movie-log.published.v1';
const values=new Map([[key,JSON.stringify([edited])],[snapshotKey,JSON.stringify([old])]]);
let writes=0;const quotaStorage={getItem:k=>values.get(k)||null,setItem(){writes++;throw Error('QuotaExceededError')}};
const quota=loadFilmState(quotaStorage,[updated]);assert.equal(quota.films[0].title,'My unsynced edit');assert.equal(quota.storageError,true);assert.equal(writes,1,'Do not advance baseline when saving films fails');assert.equal(JSON.parse(values.get(snapshotKey))[0].title,'Old');
values.set(snapshotKey,'broken JSON');const corruptBaseline=loadFilmState({getItem:k=>values.get(k)||null,setItem(){throw Error('Must not write')}},[updated]);assert.equal(corruptBaseline.films[0].title,'My unsynced edit');assert.equal(corruptBaseline.storageError,true);
console.log('PASS: quota errors and corrupt published baseline keep local films and unsynced edits');
