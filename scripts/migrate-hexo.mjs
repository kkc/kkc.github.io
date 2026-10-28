import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import * as cheerio from 'cheerio';
const root = process.argv[2] || '/tmp/blog-master/source';
const xml = fs.readFileSync('/tmp/kkc-post-sitemap.xml','utf8');
const routes = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname).filter(p=>/^\/\d{4}\//.test(p));
const report=[];
const description = s => s.replace(/```[\s\S]*?```/g,'').replace(/<[^>]*>/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[#*`>\n]/g,' ').replace(/\s+/g,' ').trim().slice(0,150);
for(const file of fs.readdirSync(path.join(root,'_posts')).filter(f=>f.endsWith('.md'))){
 let raw=fs.readFileSync(path.join(root,'_posts',file),'utf8').replace(/^\uFEFF/,'');
 if(raw.startsWith('---'))raw=raw.replace(/^---\s*\n/,'');
 const cut=raw.indexOf('\n---'); if(cut<0)throw Error('No frontmatter '+file);
 const data=YAML.parse(raw.slice(0,cut)); let body=raw.slice(cut+4).replace(/^\s*\n/,'');
 const slug=file.replace(/^\d{4}-\d{2}-\d{2}-/,'').replace(/\.md$/,'');
 const route=routes.find(p=>p.split('/').filter(Boolean).at(-1).toLowerCase()===slug.toLowerCase());
 if(!route)throw Error('Missing route '+file);
 const media=path.join(root,'_posts',file.slice(0,-3));
 if(fs.existsSync(media))fs.cpSync(media,path.join('public',route),{recursive:true});
 body=body.replace(/\{% youtube ([\w-]+) %\}/g,'<iframe src="https://www.youtube-nocookie.com/embed/$1" title="YouTube 影片" loading="lazy" allowfullscreen></iframe>')
 .replace(/\{% codeblock(?: lang:([\w]+))? %\}/g,(_,l)=>'```'+(l==='golang'?'go':l||''))
 .replace(/\{% endcodeblock %\}/g,'```')
 .replace(/\{% blockquote %\}([\s\S]*?)\{% endblockquote %\}/g,(_,q)=>q.trim().split('\n').map(l=>'> '+l).join('\n'))
 .replace(/(?:\.\.\/){1,4}img\//g,'/img/').replace(/<!--\s*more\s*-->/g,'').replace(/```cpp=/g,'```cpp').replace(/```golang/g,'```go');
 body=body.replace(/(!\[[^\]]*\]\()([^\s)]+)([^)]*\))/g,(all,start,src,end)=>{if(/^(https?:|data:|\/|#)/.test(src))return all;return start+new URL(src,'https://kkc.github.io'+route).pathname+end;});
 const date=route.slice(1,11).replaceAll('/','-');
 const tags=Array.isArray(data.tags)?data.tags:data.tags?[String(data.tags)]:[];
 const meta={title:String(data.title),date,description:description(body),tags,permalink:route};
 fs.writeFileSync('src/content/posts/'+file,'---\n'+YAML.stringify(meta,{defaultStringType:"QUOTE_DOUBLE"})+'---\n\n'+body);
 report.push({source:file,url:route,date,assets:fs.existsSync(media)});
}
// Recover the published article whose Markdown was never committed to the source repository.
const $=cheerio.load(fs.readFileSync('audit/article.html','utf8'));
const article=$('.post-container').first().clone();
article.find('.pager,.disqus_thread,#disqus_thread,script,.catalog-container,.featured-tags,.sidebar-container').remove();
const preface=article.find('#Preface');
// Retain only the published article body, up to its post navigation.
let body='';
if(preface.length){let n=preface;while(n.length&&!n.is('ul.pager,nav,.comment')){if(n.attr('id')==='disqus_thread'||n.hasClass('pager'))break;body+=$.html(n);n=n.next();}}
if(!body)throw Error('Published LTO body not found');
const meta={title:'Link Time Optimization 小記',date:'2021-10-27',description:'從 inlining、loop merging 與 code locality 理解 Link Time Optimization，記錄 GCC 的啟用方式與編譯效能取捨。',tags:['compiler','performance'],permalink:'/2021/10/27/link-time-optimization-note/'};
fs.writeFileSync('src/content/posts/2021-10-27-link-time-optimization-note.md','---\n'+YAML.stringify(meta,{defaultStringType:"QUOTE_DOUBLE"})+'---\n\n'+body);
report.push({source:'Recovered from published HTML',url:meta.permalink,date:meta.date,assets:false});
fs.writeFileSync('docs/migration-manifest.json',JSON.stringify(report,null,2)+'\n');
if(report.length!==60||new Set(report.map(p=>p.url)).size!==60)throw Error('Expected 60 unique posts');
console.log(`Migrated ${report.length} articles with their published URLs.`);
