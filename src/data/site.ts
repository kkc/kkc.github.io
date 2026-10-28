import { getCollection } from 'astro:content';
export const site={name:'Kakashi',title:'Kakashi — 技術筆記與獨立開發',description:'我是 Kakashi，寫下技術探索，也把想法做成產品。這裡收錄程式設計、系統架構的筆記，以及我打造的 App。',url:'https://kkc.github.io',email:'kakashi1000@gmail.com',github:'https://github.com/kkc'};
export async function allPosts(){const canonicalTags:Record<string,string>={kubernetes:'Kubernetes',prometheus:'Prometheus'};return (await getCollection('posts')).map(p=>({...p,data:{...p.data,tags:[...new Set(p.data.tags.map(t=>canonicalTags[t.toLowerCase()]||t))]}})).sort((a,b)=>b.data.date.localeCompare(a.data.date));}
export const topicUrl=(tag:string)=>`/tags/${encodeURIComponent(tag)}/`;
export const products=[
 {slug:'kakucut',storeUrl:'https://apps.apple.com/app/id6811591634',name:'KakuCut',category:'影片剪輯 · iOS',image:'/images/kakucut.webp',description:'讓字幕跟上你的故事。以裝置端語音辨識為核心的影片剪輯工具。',intro:'從匯入影片、產生字幕，到調整時間軸與輸出，把創作流程留在自己的裝置裡。',features:[['字幕與語音','產生與編輯字幕，調整逐字高亮、樣式和位置。'],['剪輯與編排','整理影片、裁切片段、調整速度，讓內容更有節奏。'],['輸出與分享','輸出 MP4 影片或 SRT 字幕，接續你的創作流程。']],notes:'功能、價格與系統需求，請參閱 App Store。'},
 {slug:'meowtango',storeUrl:'https://apps.apple.com/app/id6816808548',name:'MeowTango',category:'邏輯解謎 · iOS',image:'/images/meowtango.webp',description:'在貓咪的陪伴下，慢慢解開一道邏輯謎題。小小推理，大大滿足。',intro:'把邏輯推理放進溫暖的貓咪世界。觀察線索、平衡每一行與每一列，享受找到答案的那一刻。',features:[['觀察與推理','依照棋盤上的線索，找出每隻貓咪的位置。'],['溫柔的提示','卡住的時候，透過提示理解下一步的思考方向。'],['照自己的步調','一步一步解題，隨時回頭調整，享受專注的片刻。']],notes:'功能、價格與系統需求，請參閱 App Store。'}
];
