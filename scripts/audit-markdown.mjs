import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'yaml';
import {load} from 'cheerio';

// Run after `npm run build`: inspect source and the actual rendered article body.
const errors=[];
let articles=0;
for(const name of fs.readdirSync('src/content/posts').filter(n=>n.endsWith('.md'))){
 const source=fs.readFileSync(path.join('src/content/posts',name),'utf8');
 const front=source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
 const meta=front&&parse(front[1]);
 const fail=message=>errors.push(`${name}: ${message}`);
 if(!meta?.permalink){fail('Missing frontmatter/permalink');continue;}
 let fence=null;
 const lines=source.slice(front[0].length).split('\n');
 const cells=line=>line.trim().replace(/^\||\|$/g,'').split(/(?<!\\)\|/).length;
 for(let i=0;i<lines.length;i++){
  const match=lines[i].match(/^\s*(`{3,}|~{3,})(.*)$/);
  if(match){
   const [,marker,info]=match;
   if(fence){if(marker[0]===fence.char&&marker.length>=fence.length&&!info.trim())fence=null;}
   else if(marker[0]==='`'&&info.includes('`'))fail('Invalid backtick in fence language');
   else fence={char:marker[0],length:marker.length};
   continue;
  }
  if(fence)continue;
  const line=lines[i].trim();
  if(/^\|?\s*:?-+\s*\|/.test(line)&&/^\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)+\|?$/.test(line)){
   if(i&&cells(lines[i-1])!==cells(line))fail('Table header/delimiter column mismatch');
  }
 }
 if(fence)fail('Unclosed code fence');
 const file=path.join('dist',meta.permalink,'index.html');
 if(!fs.existsSync(file)){fail('Missing built article');continue;}
 articles++;
 const $=load(fs.readFileSync(file,'utf8'));
 const body=$('.article-body');
 if(!body.length){fail('Missing article body');continue;}
 body.find('p').each((_,e)=>{
  const t=$(e).text();
  if(/!\[[^\]\n]*\]\(/.test(t))fail('Unrendered Markdown image');
  if(/```/.test(t))fail('Code fence rendered as paragraph text');
  if(/\*\*\s+[^\n]+\s+\*\*/.test(t))fail('Unrendered bold markers');
 });
 body.find('pre').each((_,e)=>{
  const t=$(e).text();
  if(/(?:^|\n)#{1,3} (?:後記|結論|Reference|參考資料)\s*(?:\n|$)|<span>Photo by/.test(t))fail('Article prose appears inside a code block');
 });
 body.find('img').each((_,e)=>{
  const src=$(e).attr('src');
  if(!src){fail('Image without src');return;}
  if(src.startsWith('/')&&!src.startsWith('//')){
   if(!fs.existsSync(path.join('dist',decodeURIComponent(src.split(/[?#]/)[0]))))fail(`Missing local image: ${src}`);
  }
 });
 // Legacy Hexo code blocks use layout tables without a header: exclude those.
 body.find('table').each((_,e)=>{
  const n=$(e).find('thead th').length;if(!n)return;
  $(e).find('tbody tr').each((_,r)=>{
   const width=$(r).children('td,th').toArray().reduce((sum,c)=>sum+Number($(c).attr('colspan')||1),0);
   if(width!==n)fail(`Table row has ${width} columns, expected ${n}`);
  });
 });
}
console.log(`Audited ${articles} articles (source metadata and rendered Markdown).`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log('Passed: code blocks, image markup/local files, bold markers and table columns.');
