import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
const root=path.resolve('dist');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const html=walk(root).filter(p=>p.endsWith('.html'));
const errors=[]; const warnings=[];
const manifest=JSON.parse(fs.readFileSync('docs/migration-manifest.json','utf8'));
for(const p of manifest){if(!fs.existsSync(path.join(root,p.url,'index.html')))errors.push('Missing legacy URL '+p.url);}
for(const file of html){
 const rel=path.relative(root,file);const url='https://kkc.github.io/'+rel.replace(/index\.html$/,'');
 const $=cheerio.load(fs.readFileSync(file,'utf8'));
 if(!$('title').text().trim())errors.push('No title '+rel);
 if(!$('meta[name=description]').attr('content'))errors.push('No description '+rel);
 if(!$('link[rel=canonical]').attr('href')?.startsWith('https://kkc.github.io/'))errors.push('Invalid canonical '+rel);
 if($('html').attr('lang')!=='zh-Hant')errors.push('Invalid language '+rel);
 for(const el of $('a[href],img[src]').toArray()){
  const attr=el.tagName==='img'?'src':'href'; const raw=$(el).attr(attr);
  if(!raw||raw.startsWith('#')||/^(mailto:|tel:|data:|javascript:)/.test(raw))continue;
  let target;try{target=new URL(raw,url);}catch{errors.push('Malformed URL '+raw);continue;}
  if(target.hostname!=='kkc.github.io')continue;
  let p=decodeURIComponent(target.pathname);let disk=path.join(root,p);
  if(!fs.existsSync(disk)&&!fs.existsSync(path.join(disk,'index.html'))){
   (el.tagName==='img'?errors:warnings).push(`${rel}: missing ${attr} ${p}`);
  }
 }
}
console.log(`${manifest.length} legacy article URLs preserved; ${html.length} HTML pages checked.`);
if(warnings.length)console.log('Legacy links to review:\n'+[...new Set(warnings)].join('\n'));
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Passed: metadata, HTTPS canonical, language and local images.');
fs.writeFileSync('docs/build-verification.json',JSON.stringify({legacyArticles:manifest.length,pages:html.length,errors,warnings},null,2)+'\n');
