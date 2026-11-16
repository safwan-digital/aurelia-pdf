/* AURELIA — 100% client-side PDF tools. No uploads. */
'use strict';
if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;

const F=(key,label,type='text',def='',extra={})=>({key,label,type,def,...extra});
const TOOLS=[
 // Organize
 {id:'merge',cat:'Organize',icon:'🧩',name:'Merge PDF',desc:'Combine multiple PDFs into one, in file order.',accept:'.pdf',multiple:true},
 {id:'split',cat:'Organize',icon:'✂️',name:'Split PDF',desc:'Split by page ranges, every page, or tap pages to extract as one PDF.',accept:'.pdf',opts:[F('mode','Mode','select','ranges',{options:['ranges','each','pick']}),F('ranges','Ranges (for Ranges mode, e.g. 1-3, 4-6)','text','1-')]},
 {id:'remove-pages',cat:'Organize',icon:'🗑️',name:'Remove Pages',desc:'Tap page thumbnails to choose pages to delete — or type them below.',accept:'.pdf',opts:[F('pages','…or type pages to remove (e.g. 2, 4-5)','text','')]},
 {id:'extract-pages',cat:'Organize',icon:'📤',name:'Extract Pages',desc:'Tap page thumbnails to choose pages to extract — or type them below.',accept:'.pdf',opts:[F('pages','…or type pages to extract (e.g. 1, 3-5)','text','1')]},
 {id:'organize',cat:'Organize',icon:'🗂️',name:'Organize / Reorder',desc:'Drag page thumbnails into a new order — or type the order below.',accept:'.pdf',opts:[F('order','…or type new order (e.g. 3,1,2)','text','')]},
 {id:'rotate',cat:'Organize',icon:'🔄',name:'Rotate PDF',desc:'Tap ⟳ on any page thumbnail to rotate just that page — or rotate pages below.',accept:'.pdf',opts:[F('angle','Angle (for typed pages)','select','90',{options:['90','180','270']}),F('pages','Pages (blank = all)','text','')]},
 {id:'crop',cat:'Organize',icon:'✏️',name:'Crop PDF',desc:'Drag the crop rectangle on the preview — the trim numbers below stay in sync.',accept:'.pdf',opts:[F('left','Left trim (pt)','number','36'),F('right','Right trim (pt)','number','36'),F('top','Top trim (pt)','number','36'),F('bottom','Bottom trim (pt)','number','36')]},
 // Optimize
 {id:'compress',cat:'Optimize',icon:'🗜️',name:'Compress PDF',desc:'Re-encode pages to shrink file size. Choose your level.',accept:'.pdf',opts:[F('level','Level','select','recommended',{options:['recommended','extreme','low']})]},
 {id:'repair',cat:'Optimize',icon:'🛠️',name:'Repair PDF',desc:'Load and cleanly re-save a damaged PDF. Reports if unrecoverable.',accept:'.pdf'},
 {id:'ocr',cat:'Optimize',icon:'🔍',name:'OCR PDF',desc:'Recognise text in scanned PDFs and build a searchable text PDF. Slow for large files.',accept:'.pdf',note:'Best effort — English OCR in-browser',opts:[F('pages','Max pages to OCR','number','5')]},
 // Convert to PDF
 {id:'images-to-pdf',cat:'Convert to PDF',icon:'🖼️',name:'Images to PDF',desc:'Convert JPG & PNG images into one polished PDF.',accept:'.jpg,.jpeg,.png',multiple:true,opts:[F('size','Page size','select','A4',{options:['A4','Letter','Fit image']}),F('margin','Margin (pt)','number','24')]},
 {id:'html-to-pdf',cat:'Convert to PDF',icon:'🌐',name:'HTML to PDF',desc:'Upload an .html file — its text becomes a clean PDF.',accept:'.html,.htm'},
 {id:'word-to-pdf',cat:'Convert to PDF',icon:'📝',name:'Word to PDF',desc:'Convert .docx text into a clean PDF.',accept:'.docx',note:'Beta — text-based, complex layouts simplified'},
 {id:'text-to-pdf',cat:'Convert to PDF',icon:'🔤',name:'Text to PDF',desc:'Turn a .txt file into a formatted PDF.',accept:'.txt'},
 // Convert from PDF
 {id:'pdf-to-jpg',cat:'Convert from PDF',icon:'📸',name:'PDF to JPG',desc:'Render each page as a high-quality JPG (ZIP if many).',accept:'.pdf',opts:[F('scale','Quality scale','select','2',{options:['1','2','3']})]},
 {id:'pdf-to-png',cat:'Convert from PDF',icon:'🎨',name:'PDF to PNG',desc:'Render each page as a lossless PNG (ZIP if many).',accept:'.pdf',opts:[F('scale','Scale','select','2',{options:['1','2','3']})]},
 {id:'pdf-to-text',cat:'Convert from PDF',icon:'📄',name:'PDF to Text',desc:'Extract all readable text as a .txt file.',accept:'.pdf'},
 {id:'pdf-to-word',cat:'Convert from PDF',icon:'📘',name:'PDF to Word',desc:'Extract text into an editable .docx file.',accept:'.pdf',note:'Beta — text-based, not pixel-perfect'},
 {id:'pdf-to-excel',cat:'Convert from PDF',icon:'📊',name:'PDF to Excel',desc:'Extract text lines into a spreadsheet (.xlsx).',accept:'.pdf',note:'Beta — text lines, tables are approximate'},
 {id:'pdf-to-markdown',cat:'Convert from PDF',icon:'⬇️',name:'PDF to Markdown',desc:'Extract text as Markdown, page by page.',accept:'.pdf'},
 // Edit
 {id:'edit-pdf',cat:'Edit',icon:'✍️',name:'Edit PDF',desc:'Click on the page preview to place your text exactly there.',accept:'.pdf',opts:[F('text','Text to add','text','Hello from AURELIA'),F('page','Page number','number','1'),F('size','Font size','number','18')]},
 {id:'annotate',cat:'Edit',icon:'💬',name:'Annotate PDF',desc:'Drag a rectangle on the page preview to place a highlighted note.',accept:'.pdf',opts:[F('text','Note text','text','Note'),F('page','Page number','number','1')]},
 {id:'page-numbers',cat:'Edit',icon:'🔢',name:'Add Page Numbers',desc:'Stamp page numbers on every page.',accept:'.pdf',opts:[F('position','Position','select','bottom-center',{options:['bottom-center','bottom-right','bottom-left','top-center','top-right']}),F('format','Format','select','n',{options:['n','Page n','n / total']})]},
 {id:'watermark',cat:'Edit',icon:'💧',name:'Watermark',desc:'Add a translucent text watermark to every page.',accept:'.pdf',opts:[F('text','Watermark text','text','CONFIDENTIAL'),F('opacity','Opacity 0.05–0.6','number','0.18'),F('size','Font size','number','42')]},
 {id:'sign-pdf',cat:'Edit',icon:'🖊️',name:'Sign PDF',desc:'Draw your signature, then drag it anywhere on any page preview.',accept:'.pdf',sig:true},
 {id:'redact',cat:'Edit',icon:'⬛',name:'Redact PDF',desc:'Drag rectangles on the page preview to cover sensitive areas — add as many as you need.',accept:'.pdf',opts:[F('page','Page number','number','1')]},
 // Security
 {id:'protect',cat:'Security',icon:'🔐',name:'Protect PDF',desc:'Encrypt your PDF with a password you choose.',accept:'.pdf',opts:[F('password','Password','password',''),F('confirm','Confirm password','password','')]},
 {id:'unlock',cat:'Security',icon:'🔓',name:'Unlock PDF',desc:'Remove password protection from a PDF you own and are authorised to open.',accept:'.pdf',note:'Best effort — works on many permission-protected files',opts:[F('password','Current password (if any)','password','')]},
 {id:'metadata',cat:'Security',icon:'🏷️',name:'Metadata Editor',desc:'View and edit title, author, subject & keywords.',accept:'.pdf',opts:[F('title','Title','text',''),F('author','Author','text',''),F('subject','Subject','text',''),F('keywords','Keywords (comma separated)','text','')]},
 // Other
 {id:'compare',cat:'Compare & AI',icon:'⚖️',name:'Compare PDF',desc:'Upload 2 PDFs — get a text difference report.',accept:'.pdf',multiple:true},
 {id:'summarize',cat:'Compare & AI',icon:'✨',name:'Summarize PDF',desc:'Local extractive summary — no AI server, no upload.',accept:'.pdf',note:'Extractive summary runs 100% locally'},
];
let current=null, files=[];
const $=id=>document.getElementById(id);
function toast(m){const t=$('toast');t.textContent=m;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),4200)}
function showHome(){$('homeView').classList.remove('hidden');$('toolView').classList.add('hidden');window.scrollTo({top:0,behavior:'smooth'})}
function fmt(n){return n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB'}
const POPULAR=['merge','compress','pdf-to-jpg','images-to-pdf'];
function renderTools(filter=''){
  const cats=[...new Set(TOOLS.map(t=>t.cat))]; let html='';
  if(!filter){const pop=POPULAR.map(id=>TOOLS.find(t=>t.id===id)).filter(Boolean);
    html+=`<section class="cat"><h2>⭐ Most popular</h2><p>The everyday tools — one tap away</p><div class="grid">${pop.map(t=>`<button class="card glass" onclick="openTool('${t.id}')"><div class="ic">${t.icon}</div><h3>${t.name}</h3><p>${t.desc}</p>${t.note?`<span class="pill">${t.note.split('—')[0]}</span>`:''}</button>`).join('')}</div></section>`}
  cats.forEach(c=>{const list=TOOLS.filter(t=>t.cat===c&&(t.name+' '+t.desc).toLowerCase().includes(filter.toLowerCase())); if(!list.length)return;
    html+=`<section class="cat"><h2>${c}</h2><p>${list.length} tool(s)</p><div class="grid">${list.map(t=>`<button class="card glass" onclick="openTool('${t.id}')"><div class="ic">${t.icon}</div><h3>${t.name}</h3><p>${t.desc}</p>${t.note?`<span class="pill">${t.note.split('—')[0]}</span>`:''}</button>`).join('')}</div></section>`});
  $('tools').innerHTML=html||'<p style="text-align:center;color:var(--muted)">No tools match your search.</p>';
}
$('searchInput').addEventListener('input',e=>renderTools(e.target.value));
$('themeBtn').addEventListener('click',()=>{const h=document.documentElement;const d=h.dataset.theme!=='dark';h.dataset.theme=d?'dark':'light';$('themeBtn').textContent=d?'☀️ Light':'🌙 Dark'});
function openTool(id){current=TOOLS.find(t=>t.id===id);files=[];$('homeView').classList.add('hidden');$('toolView').classList.remove('hidden');
  $('toolTitle').textContent=current.icon+' '+current.name;$('toolDesc').textContent=current.desc;
  const n=$('toolNote'); if(current.note){n.textContent=current.note;n.classList.remove('hidden')}else n.classList.add('hidden');
  $('fileInput').accept=current.accept;$('fileInput').multiple=!!current.multiple;
  $('acceptHint').textContent='Accepts: '+current.accept+(current.multiple?' · multiple files':' · single file');
  $('sigWrap').classList.toggle('hidden',!current.sig); if(current.sig) initSig();
  $('toolOpts').innerHTML=(current.opts||[]).map(o=>{if(o.type==='select')return `<div class="field"><label>${o.label}</label><select id="opt_${o.key}">${o.options.map(v=>`<option ${v===o.def?'selected':''}>${v}</option>`).join('')}</select></div>`;return `<div class="field"><label>${o.label}</label><input id="opt_${o.key}" type="${o.type}" value="${o.def||''}" placeholder="${o.label}"></div>`}).join('');
  wrapAdvanced(); updateActionLabel();
  resetTool(false); window.scrollTo({top:0,behavior:'smooth'});}
function resetTool(clear=true){if(clear)files=[];renderFileList();clearVisual();$('resultBox').innerHTML='';$('status').textContent='';setProg(0,true);if(clear)$('fileInput').value=''}
function setProg(p,hide=false){$('progWrap').classList.toggle('hidden',hide);$('progBar').style.width=(p*100)+'%'}
const dz=$('dropZone');['dragover','dragenter'].forEach(e=>dz.addEventListener(e,ev=>{ev.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(e=>dz.addEventListener(e,ev=>{ev.preventDefault();dz.classList.remove('drag')}));
dz.addEventListener('drop',e=>addFiles([...e.dataTransfer.files])); $('fileInput').addEventListener('change',e=>{addFiles([...e.target.files]);e.target.value=''});
function addFiles(list){if(!list||!list.length)return;files=current&&current.multiple?files.concat(list):list.slice(0,1);renderFileList();onFilesChanged()}
function renderFileList(){const el=$('fileList');if(!el)return;if(!files.length){el.innerHTML='';return}const multi=current&&current.multiple;
  el.innerHTML=files.map((f,i)=>`<div class="fileitem"><span class="fname">${i+1}. ${f.name}</span><span class="fmeta">${fmt(f.size)}</span><span class="fbtns">${multi&&files.length>1?`<button type="button" class="chipbtn" title="Move up" onclick="moveFile(${i},-1)">↑</button><button type="button" class="chipbtn" title="Move down" onclick="moveFile(${i},1)">↓</button>`:''}<button type="button" class="chipbtn rm" title="Remove file" onclick="removeFile(${i})">×</button></span></div>`).join('')
  +`<div class="filebar"><span id="fileCount">${files.length} file${files.length>1?'s':''} ready</span>${multi?`<label class="btn secondary addmore" for="fileInput">+ Add more files</label>`:''}</div>`;updateActionLabel()}
function removeFile(i){files.splice(i,1);renderFileList();onFilesChanged()}
function moveFile(i,d){const j=i+d;if(j<0||j>=files.length)return;const t=files[i];files[i]=files[j];files[j]=t;renderFileList();onFilesChanged()}
function opt(k){const el=$('opt_'+k);return el?el.value:''}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.textContent='⬇️ Download '+name+' ('+fmt(blob.size)+')';a.className='btn';const b=document.createElement('div');b.appendChild(a);$('resultBox').appendChild(b);return a}
function done(msg){$('status').textContent=msg;setProg(1);toast(msg)}
async function bytes(f){return new Uint8Array(await f.arrayBuffer())}
function parseRanges(str,total){const out=new Set(); if(!str||!str.trim())return null; str.split(',').map(s=>s.trim()).filter(Boolean).forEach(p=>{if(p.includes('-')){let[a,b]=p.split('-').map(x=>parseInt(x)); if(isNaN(a))a=1; if(isNaN(b)||p.trim().endsWith('-'))b=total; for(let i=Math.max(1,a);i<=Math.min(total,b);i++)out.add(i-1)}else{const n=parseInt(p);if(n>=1&&n<=total)out.add(n-1)}});return [...out].sort((a,b)=>a-b)}
function wrapText(text,font,size,maxW){const words=text.split(/\s+/);const lines=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(font.widthOfTextAtSize(t,size)>maxW&&line){lines.push(line);line=w}else line=t}if(line)lines.push(line);return lines}
async function textToPdfDoc(text,title='Document'){const doc=await PDFDocument.create();const font=await doc.embedFont(StandardFonts.Helvetica);let page=doc.addPage([595,842]);let y=800;const addPage=()=>{page=doc.addPage([595,842]);y=800}; text.split(/\n/).forEach(raw=>{const lines=raw===''?['']:wrapText(raw,font,11,495);lines.forEach(l=>{if(y<50)addPage();page.drawText(l,{x:50,y,size:11,font,color:rgb(.1,.1,.1)});y-=16})});doc.setTitle(title);return doc}
async function extractText(pdfBytes){const pdf=await pdfjsLib.getDocument({data:pdfBytes.slice()}).promise;let pages=[];for(let i=1;i<=pdf.numPages;i++){const pg=await pdf.getPage(i);const tc=await pg.getTextContent();let lastY=null,line='',lines=[];tc.items.forEach(it=>{if(lastY!==null&&Math.abs(it.transform[5]-lastY)>2){lines.push(line);line=''}line+=it.str+' ';lastY=it.transform[5]});if(line)lines.push(line);pages.push(lines.join('\n'))}return pages}
async function renderPages(pdfBytes,scale=2,type='image/jpeg',quality=.85){const pdf=await pdfjsLib.getDocument({data:pdfBytes.slice()}).promise;const out=[];for(let i=1;i<=pdf.numPages;i++){const pg=await pdf.getPage(i);const vp=pg.getViewport({scale});const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;out.push(await new Promise(r=>c.toBlob(r,type,quality)))}return out}
function baseName(f){return f.name.replace(/\.[^.]+$/,'')}
let sigCtx;function initSig(){const c=$('sigpad');sigCtx=c.getContext('2d');sigCtx.lineWidth=3;sigCtx.lineCap='round';let down=false,last;const pos=e=>{const r=c.getBoundingClientRect();const p=e.touches?e.touches[0]:e;return{x:(p.clientX-r.left)*(c.width/r.width),y:(p.clientY-r.top)*(c.height/r.height)}};c.onmousedown=c.ontouchstart=e=>{down=true;last=pos(e);e.preventDefault()};c.onmousemove=c.ontouchmove=e=>{if(!down)return;const p=pos(e);sigCtx.beginPath();sigCtx.moveTo(last.x,last.y);sigCtx.lineTo(p.x,p.y);sigCtx.stroke();sigDrawn=true;if(ed&&ed.kind==='sign-pdf')drawEdOverlay();last=p;e.preventDefault()};c.onmouseup=c.ontouchend=()=>down=false}
function clearSig(){const c=$('sigpad');sigCtx&&sigCtx.clearRect(0,0,c.width,c.height);sigDrawn=false;if(ed&&ed.kind==='sign-pdf')drawEdOverlay()}

/* ================= V2: visual page manager + placement editors =================
   All overlay positions are stored as fractions of the page (0..1), so preview
   size / device width never matter. PDF y-axis is flipped at stamp time:
   pdfY = pageH - (fy + fh) * pageH. Placement assumes page rotation 0 —
   pages with existing rotation are an edge limit (noted in TEST-REPORT). */
const VISUAL_PM={'remove-pages':'remove','extract-pages':'extract','organize':'organize','rotate':'rotate'};
const EDITOR_TOOLS=['crop','sign-pdf','edit-pdf','annotate','redact'];
let pm=null, ed=null, visualSeq=0, sigDrawn=false;
function clearVisual(){visualSeq++;pm=null;ed=null;const w=$('visualWrap');if(w){w.innerHTML='';w.classList.add('hidden')}}
function onFilesChanged(){if(!current)return;const needs=VISUAL_PM[current.id]||current.id==='split'||EDITOR_TOOLS.includes(current.id);if(needs&&files.length&&/\.pdf$/i.test(files[0].name))buildVisual();else if(!files.length)clearVisual()}
/* ---------- User-friendliness: plain labels, collapsed advanced, friendly errors ---------- */
const HIDE_OPTS={'remove-pages':['pages'],'extract-pages':['pages'],'organize':['order'],'rotate':['angle','pages'],'edit-pdf':['page'],'annotate':['page'],'redact':['page'],'split':['ranges']};
function wrapAdvanced(){if(!current)return;const hide=HIDE_OPTS[current.id];if(!hide)return;const box=$('toolOpts');if(!box)return;
  const fields=[...box.querySelectorAll('.field')].filter(f=>{const inp=f.querySelector('input,select,textarea');return inp&&hide.includes(inp.id.replace('opt_',''))});
  if(!fields.length)return;const det=document.createElement('details');det.className='adv';det.innerHTML='<summary>Advanced options — type instead of tapping</summary>';
  const grid=document.createElement('div');grid.className='opts';fields.forEach(f=>grid.appendChild(f));det.appendChild(grid);box.appendChild(det)}
function updateActionLabel(){const btn=$('processBtn');if(!btn||!current)return;const n=files.length;const sel=pm?pm.sel.size:0;let label=current.name;
  if(current.id==='merge')label=n>1?'Merge '+n+' PDFs':'Merge PDF';
  else if(current.id==='remove-pages')label=sel?'Remove '+sel+' page'+(sel>1?'s':''):'Remove pages';
  else if(current.id==='extract-pages')label=sel?'Extract '+sel+' page'+(sel>1?'s':''):'Extract pages';
  else if(current.id==='split'){const m=opt('mode');label=m==='pick'?(sel?'Extract '+sel+' pages as one PDF':'Extract picked pages'):'Split PDF'}
  else if(current.id==='organize')label='Save new order';
  else if(current.id==='rotate')label='Save rotated PDF';
  else if(current.id==='sign-pdf')label='Place signature & download';
  else if(current.id==='edit-pdf')label='Add text & download';
  else if(current.id==='annotate')label='Add note & download';
  else if(current.id==='redact')label=ed&&ed.boxes.length?'Cover '+ed.boxes.length+' area'+(ed.boxes.length>1?'s':'')+' & download':'Cover areas & download';
  else if(current.id==='images-to-pdf')label=n>1?'Make PDF from '+n+' images':'Make PDF';
  else if(current.id==='compare')label='Compare the 2 PDFs';
  btn.textContent=label;btn.classList.toggle('pulse',n>0)}
function friendlyError(e){const m=(e&&e.message)||'';
  if(m.length<140&&!/TypeError|Cannot read|Cannot access|undefined is|null is|is not a function|NetworkError|Failed to fetch/i.test(m))return m;
  return 'Something went wrong with that file. Please try a different PDF — or a smaller, simpler one.'}
async function buildVisual(){
  const seq=++visualSeq;pm=null;ed=null;const w=$('visualWrap');if(!w)return;const wasHidden=w.classList.contains('hidden');w.classList.remove('hidden');w.innerHTML='<p class="vload">Rendering page previews…</p>';
  let pdf;try{const raw=await bytes(files[0]);pdf=await pdfjsLib.getDocument({data:raw.slice()}).promise}catch(e){if(seq===visualSeq)w.innerHTML='<p class="vload">Could not render previews ('+e.message+'). The options below still work.</p>';return}
  if(seq!==visualSeq||!current)return;
  if(VISUAL_PM[current.id])buildPageManager(pdf,VISUAL_PM[current.id]);
  else if(current.id==='split'){buildPageManager(pdf,'pick');const m=$('opt_mode');if(m)m.addEventListener('change',updateActionLabel)}
  else buildEditor(pdf,current.id);
  updateActionLabel();
  if(wasHidden)setTimeout(()=>{const vw=$('visualWrap');if(vw&&visualSeq===seq)vw.scrollIntoView({behavior:'smooth',block:'start'})},80);
}
/* ---------- Page Manager (Remove / Extract / Organize / Rotate / Split-pick) ---------- */
function buildPageManager(pdf,mode){
  pm={mode,pdf,count:pdf.numPages,sel:new Set(),order:[...Array(pdf.numPages).keys()],rot:{},rendered:new Set(),thumbEls:[]};
  const hints={remove:'Tap pages to mark them for removal.',extract:'Tap pages to extract.',organize:'Drag thumbnails — or use ◀ ▶ — to reorder.',rotate:'Tap ⟳ on a page to rotate just that page 90°.',pick:'Set Mode = “pick” below, then tap the pages to extract together as one PDF.'};
  $('visualWrap').innerHTML=`<div class="pm"><div class="pm-toolbar"><strong>Pages (${pm.count})</strong><span class="pm-hint">${hints[mode]||''}</span>${(mode==='remove'||mode==='extract'||mode==='pick')?'<button type="button" class="chipbtn wide" onclick="pmSelectAll()">Select all</button><button type="button" class="chipbtn wide" onclick="pmClearSel()">Clear</button>':''}<span id="pmSelInfo" class="pm-info"></span></div><div class="thumbgrid mode-${mode}" id="thumbGrid"></div></div>`;
  const grid=$('thumbGrid');
  for(let i=0;i<pm.count;i++){
    const d=document.createElement('div');d.className='thumb';d.dataset.idx=i;
    d.innerHTML=`<div class="thumb-wrap"><canvas></canvas>${mode==='remove'?'<div class="thumb-x">✕</div>':''}${(mode==='extract'||mode==='pick')?'<div class="thumb-check">✓</div>':''}${mode==='rotate'?'<button type="button" class="rotbtn" title="Rotate this page 90°">⟳</button>':''}${mode==='organize'?'<div class="thumb-move"><button type="button" class="chipbtn" data-mv="-1" title="Move earlier">◀</button><button type="button" class="chipbtn" data-mv="1" title="Move later">▶</button></div>':''}</div><div class="thumb-label">Page ${i+1}</div>`;
    grid.appendChild(d);pm.thumbEls[i]=d;
    if(mode==='remove'||mode==='extract'||mode==='pick'){d.addEventListener('click',()=>{if(pm.sel.has(i))pm.sel.delete(i);else pm.sel.add(i);d.classList.toggle('sel',pm.sel.has(i));pmSync();pmInfo()})}
    if(mode==='rotate'){d.querySelector('.rotbtn').addEventListener('click',ev=>{ev.stopPropagation();pm.rot[i]=((pm.rot[i]||0)+90)%360;d.querySelector('canvas').style.transform='rotate('+pm.rot[i]+'deg)';pmInfo()})}
    if(mode==='organize'){d.querySelectorAll('[data-mv]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();moveThumb(i,parseInt(b.dataset.mv))}));attachThumbDrag(d)}
  }
  pmInfo();
  const renderThumb=async i=>{if(!pm||pm.rendered.has(i))return;pm.rendered.add(i);try{const pg=await pdf.getPage(i+1);const base=pg.getViewport({scale:1});const vp=pg.getViewport({scale:150/base.width});const c=pm.thumbEls[i].querySelector('canvas');c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise}catch(e){}};
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{es.forEach(en=>{if(en.isIntersecting){renderThumb(parseInt(en.target.dataset.idx));io.unobserve(en.target)}})},{rootMargin:'240px'});pm.thumbEls.forEach(d=>io.observe(d))}else pm.thumbEls.forEach((d,i)=>renderThumb(i));
}
function pmSync(){if(!pm)return;const sorted=[...pm.sel].sort((a,b)=>a-b).map(i=>i+1).join(',');
  if(pm.mode==='remove'||pm.mode==='extract'){const el=$('opt_pages');if(el)el.value=sorted}
  if(pm.mode==='organize'){const el=$('opt_order');if(el)el.value=pm.order.map(i=>i+1).join(',')}}
function pmInfo(){if(!pm)return;const el=$('pmSelInfo');if(!el)return;let t='';
  if(pm.mode==='remove')t=pm.sel.size?pm.sel.size+' marked for removal':'None marked';
  else if(pm.mode==='extract'||pm.mode==='pick')t=pm.sel.size?pm.sel.size+' selected':'None selected';
  else if(pm.mode==='rotate'){const n=Object.values(pm.rot).filter(a=>a).length;t=n?n+' page(s) rotated':''}
  else if(pm.mode==='organize')t='Order: '+pm.order.map(i=>i+1).join(', ');
  el.textContent=t;updateActionLabel()}
function pmSelectAll(){if(!pm)return;for(let i=0;i<pm.count;i++){pm.sel.add(i);pm.thumbEls[i].classList.add('sel')}pmSync();pmInfo()}
function pmClearSel(){if(!pm)return;pm.sel.clear();pm.thumbEls.forEach(d=>d.classList.remove('sel'));pmSync();pmInfo()}
function moveThumb(pageIdx,dir){if(!pm)return;const pos=pm.order.indexOf(pageIdx);const j=pos+dir;if(j<0||j>=pm.order.length)return;const t=pm.order[pos];pm.order[pos]=pm.order[j];pm.order[j]=t;const grid=$('thumbGrid');pm.order.forEach(pi=>grid.appendChild(pm.thumbEls[pi]));pmSync();pmInfo()}
function attachThumbDrag(d){
  d.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const startX=e.clientX,startY=e.clientY;let dragging=false;
    const move=ev=>{const dx=ev.clientX-startX,dy=ev.clientY-startY;
      if(!dragging&&Math.hypot(dx,dy)>9){dragging=true;d.classList.add('dragging');d.setPointerCapture(e.pointerId)}
      if(!dragging)return;d.style.transform=`translate(${dx}px,${dy}px)`;
      const over=document.elementFromPoint(ev.clientX,ev.clientY);const tEl=over&&over.closest?over.closest('.thumb'):null;
      if(tEl&&tEl!==d&&pm){const from=pm.order.indexOf(parseInt(d.dataset.idx));const to=pm.order.indexOf(parseInt(tEl.dataset.idx));if(from>-1&&to>-1&&from!==to){pm.order.splice(from,1);pm.order.splice(to,0,parseInt(d.dataset.idx));const grid=$('thumbGrid');pm.order.forEach(pi=>grid.appendChild(pm.thumbEls[pi]));pmSync();pmInfo()}}};
    const up=()=>{d.classList.remove('dragging');d.style.transform='';d.removeEventListener('pointermove',move);d.removeEventListener('pointerup',up);d.removeEventListener('pointercancel',up)};
    d.addEventListener('pointermove',move);d.addEventListener('pointerup',up);d.addEventListener('pointercancel',up)});
}
/* ---------- Placement editor (Sign / Edit / Annotate / Redact / Crop) ---------- */
function buildEditor(pdf,kind){
  ed={kind,pdf,count:pdf.numPages,page:0,pageW:0,pageH:0,boxes:[],marker:null,rect:null,signPos:{fx:.52,fy:.76},signW:.38,crop:{fx:.07,fy:.07,fw:.86,fh:.86}};
  const titles={'crop':'Crop — drag the rectangle, resize from the corner','sign-pdf':'Place your signature — drag it anywhere on the page','edit-pdf':'Click on the page to place your text','annotate':'Drag a rectangle for your note','redact':'Drag rectangles to cover sensitive areas'};
  $('visualWrap').innerHTML=`<div class="pm"><div class="pm-toolbar"><strong>${titles[kind]||''}</strong><span class="pm-nav"><button type="button" class="chipbtn wide" onclick="edNav(-1)">◀ Prev</button><span id="edPageInfo" class="pm-info"></span><button type="button" class="chipbtn wide" onclick="edNav(1)">Next ▶</button></span></div><div class="stage" id="edStage"><canvas id="edCanvas"></canvas><div id="edOverlay"></div></div><div id="edExtra"></div></div>`;
  if(kind==='sign-pdf'){$('edExtra').innerHTML=`<div class="field" style="margin-top:12px;max-width:340px"><label>Signature size</label><input type="range" id="signSize" min="12" max="85" value="38"></div><p class="pm-hint">Draw your signature in the pad below first — it appears on the preview and can be dragged to any position, on any page. Placement assumes unrotated pages.</p>`;$('signSize').addEventListener('input',e=>{ed.signW=e.target.value/100;drawEdOverlay()})}
  if(kind==='redact'){$('edExtra').innerHTML='<div id="boxList" style="margin-top:10px"></div>';renderBoxList()}
  if(kind==='crop'){$('edExtra').innerHTML='<p class="pm-hint">The trim numbers below update as you drag. Crop applies to all pages with these proportions converted to points.</p>'}
  if(kind==='edit-pdf'||kind==='annotate'){$('edExtra').innerHTML='<p class="pm-hint">Page selector above and the “Page number” field below stay in sync.</p>'}
  renderEdPage();attachStageHandlers();
}
function edNav(d){if(!ed)return;ed.page=Math.min(ed.count-1,Math.max(0,ed.page+d));renderEdPage()}
async function renderEdPage(){
  if(!ed)return;const info=$('edPageInfo');if(info)info.textContent='Page '+(ed.page+1)+' of '+ed.count;
  const pageField=$('opt_page');if(pageField&&(ed.kind==='edit-pdf'||ed.kind==='annotate'||ed.kind==='redact'))pageField.value=ed.page+1;
  try{const pg=await ed.pdf.getPage(ed.page+1);const base=pg.getViewport({scale:1});ed.pageW=base.width;ed.pageH=base.height;
    const wrap=$('visualWrap');const targetW=Math.min(720,Math.max(300,(wrap?wrap.clientWidth:720)-36));const vp=pg.getViewport({scale:targetW/base.width});
    const c=$('edCanvas');if(!c)return;c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise}catch(e){}
  drawEdOverlay();if(ed&&ed.kind==='crop')syncCropOpts();
}
function fracFromEvent(e){const r=$('edOverlay').getBoundingClientRect();return{fx:Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),fy:Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))}}
function drawEdOverlay(){
  if(!ed)return;const ov=$('edOverlay');if(!ov)return;ov.innerHTML='';
  if(ed.kind==='sign-pdf'){if(!sigDrawn)return;const b=document.createElement('div');b.className='sigbox';b.id='sigBox';b.style.left=(ed.signPos.fx*100)+'%';b.style.top=(ed.signPos.fy*100)+'%';b.style.width=(ed.signW*100)+'%';const img=document.createElement('img');img.src=$('sigpad').toDataURL('image/png');img.alt='Your signature';b.appendChild(img);ov.appendChild(b);
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const start=fracFromEvent(e);const off={dx:start.fx-ed.signPos.fx,dy:start.fy-ed.signPos.fy};b.setPointerCapture(e.pointerId);
      const move=ev=>{const p=fracFromEvent(ev);ed.signPos.fx=Math.min(1-ed.signW,Math.max(0,p.fx-off.dx));ed.signPos.fy=Math.min(.98,Math.max(0,p.fy-off.dy));b.style.left=(ed.signPos.fx*100)+'%';b.style.top=(ed.signPos.fy*100)+'%'};
      const up=()=>{b.removeEventListener('pointermove',move);b.removeEventListener('pointerup',up)};b.addEventListener('pointermove',move);b.addEventListener('pointerup',up)});return}
  if(ed.kind==='edit-pdf'){if(ed.marker&&ed.marker.page===ed.page){const m=document.createElement('div');m.className='marker';m.style.left=(ed.marker.fx*100)+'%';m.style.top=(ed.marker.fy*100)+'%';m.textContent=($('opt_text')?$('opt_text').value:'')||'Text';ov.appendChild(m)}return}
  if(ed.kind==='annotate'){if(ed.rect&&ed.rect.page===ed.page)ov.appendChild(rectDiv(ed.rect,'notebox',''));return}
  if(ed.kind==='redact'){ed.boxes.forEach((bx,i)=>{if(bx.page!==ed.page)return;const d=rectDiv(bx,'rbox','');const x=document.createElement('button');x.type='button';x.className='rbox-x';x.textContent='×';x.title='Remove this box';x.addEventListener('pointerdown',ev=>ev.stopPropagation());x.addEventListener('click',ev=>{ev.stopPropagation();ed.boxes.splice(i,1);drawEdOverlay();renderBoxList()});d.appendChild(x);ov.appendChild(d)});return}
  if(ed.kind==='crop'){const r=ed.crop;const d=document.createElement('div');d.className='crop-rect';d.style.left=(r.fx*100)+'%';d.style.top=(r.fy*100)+'%';d.style.width=(r.fw*100)+'%';d.style.height=(r.fh*100)+'%';const h=document.createElement('div');h.className='crop-handle';h.title='Drag to resize';d.appendChild(h);ov.appendChild(d);
    d.addEventListener('pointerdown',e=>{if(e.target===h)return;e.preventDefault();const start=fracFromEvent(e);const orig={...ed.crop};d.setPointerCapture(e.pointerId);
      const move=ev=>{const p=fracFromEvent(ev);ed.crop.fx=Math.min(1-ed.crop.fw,Math.max(0,orig.fx+(p.fx-start.fx)));ed.crop.fy=Math.min(1-ed.crop.fh,Math.max(0,orig.fy+(p.fy-start.fy)));d.style.left=(ed.crop.fx*100)+'%';d.style.top=(ed.crop.fy*100)+'%';syncCropOpts()};
      const up=()=>{d.removeEventListener('pointermove',move);d.removeEventListener('pointerup',up)};d.addEventListener('pointermove',move);d.addEventListener('pointerup',up)});
    h.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const start=fracFromEvent(e);const orig={...ed.crop};h.setPointerCapture(e.pointerId);
      const move=ev=>{const p=fracFromEvent(ev);ed.crop.fw=Math.min(1-ed.crop.fx,Math.max(.08,orig.fw+(p.fx-start.fx)));ed.crop.fh=Math.min(1-ed.crop.fy,Math.max(.08,orig.fh+(p.fy-start.fy)));d.style.width=(ed.crop.fw*100)+'%';d.style.height=(ed.crop.fh*100)+'%';syncCropOpts()};
      const up=()=>{h.removeEventListener('pointermove',move);h.removeEventListener('pointerup',up)};h.addEventListener('pointermove',move);h.addEventListener('pointerup',up)});return}
}
function rectDiv(r,cls){const d=document.createElement('div');d.className=cls;d.style.left=(r.fx*100)+'%';d.style.top=(r.fy*100)+'%';d.style.width=(r.fw*100)+'%';d.style.height=(r.fh*100)+'%';return d}
function renderBoxList(){const el=$('boxList');if(!el||!ed)return;el.innerHTML=ed.boxes.length?('<strong>'+ed.boxes.length+' box(es):</strong> '+ed.boxes.map((b,i)=>`<span class="boxitem">Page ${b.page+1} <button type="button" class="chipbtn rm" onclick="removeBox(${i})">×</button></span>`).join(' ')):'<span class="pm-hint">No boxes yet — drag on the page to add one.</span>';updateActionLabel()}
function removeBox(i){if(!ed)return;ed.boxes.splice(i,1);drawEdOverlay();renderBoxList()}
function syncCropOpts(){if(!ed||!ed.pageW)return;const r=ed.crop;const set=(k,v)=>{const el=$('opt_'+k);if(el)el.value=Math.max(0,Math.round(v))};set('left',r.fx*ed.pageW);set('right',(1-r.fx-r.fw)*ed.pageW);set('top',r.fy*ed.pageH);set('bottom',(1-r.fy-r.fh)*ed.pageH)}
function attachStageHandlers(){
  const ov=$('edOverlay');if(!ov||!ed)return;
  if(ed.kind==='edit-pdf'){const txt=$('opt_text');if(txt)txt.addEventListener('input',()=>drawEdOverlay());
    ov.addEventListener('pointerdown',e=>{const p=fracFromEvent(e);ed.marker={fx:p.fx,fy:p.fy,page:ed.page};drawEdOverlay()});return}
  if(ed.kind==='annotate'||ed.kind==='redact'){
    ov.addEventListener('pointerdown',e=>{if(e.target.closest('.rbox-x'))return;const start=fracFromEvent(e);const ghost=rectDiv({fx:start.fx,fy:start.fy,fw:0,fh:0},ed.kind==='redact'?'rbox':'notebox');ov.appendChild(ghost);
      const move=ev=>{const p=fracFromEvent(ev);const r={fx:Math.min(start.fx,p.fx),fy:Math.min(start.fy,p.fy),fw:Math.abs(p.fx-start.fx),fh:Math.abs(p.fy-start.fy)};ghost.style.left=(r.fx*100)+'%';ghost.style.top=(r.fy*100)+'%';ghost.style.width=(r.fw*100)+'%';ghost.style.height=(r.fh*100)+'%';ghost.dataset.rect=JSON.stringify(r)};
      const up=()=>{ov.removeEventListener('pointermove',move);ov.removeEventListener('pointerup',up);const r=ghost.dataset.rect?JSON.parse(ghost.dataset.rect):null;ghost.remove();if(r&&r.fw>.01&&r.fh>.01){r.page=ed.page;if(ed.kind==='redact'){ed.boxes.push(r);renderBoxList()}else ed.rect=r}drawEdOverlay()};
      ov.addEventListener('pointermove',move);ov.addEventListener('pointerup',up)});return}
}

$('processBtn').addEventListener('click',async()=>{
  if(!current)return; $('resultBox').innerHTML='';
  // text-to-pdf / html-to-pdf can work from file only (by design)
  if(!files.length){toast('Please choose a file first.');return}
  setProg(.08); $('status').textContent='Working locally in your browser…';
  try{ await processTool(); }catch(err){console.error(err);const fe=friendlyError(err);$('status').textContent='⚠️ '+fe;toast(fe);setProg(0,true)}
});
async function saveDoc(doc,name){download(new Blob([await doc.save()],{type:'application/pdf'}),name)}
async function zipOut(items,name){if(items.length===1){download(items[0].blob,items[0].name)}else{const zip=new JSZip();items.forEach(i=>zip.file(i.name,i.blob));download(await zip.generateAsync({type:'blob'}),name)}}
async function processTool(){
  const id=current.id, f=files[0];
  if(id==='merge'){const out=await PDFDocument.create();for(const file of files){const src=await PDFDocument.load(await bytes(file));(await out.copyPages(src,src.getPageIndices())).forEach(p=>out.addPage(p));setProg(.3+.5*files.indexOf(file)/files.length)}await saveDoc(out,'aurelia-merged.pdf');return done('Merged '+files.length+' PDFs.')}
  if(id==='text-to-pdf'){const doc=await textToPdfDoc(await f.text(),baseName(f));await saveDoc(doc,baseName(f)+'.pdf');return done('Text converted to PDF.')}
  if(id==='html-to-pdf'){const html=await f.text();const div=document.createElement('div');div.innerHTML=html;const doc=await textToPdfDoc(div.innerText||div.textContent,baseName(f));await saveDoc(doc,baseName(f)+'.pdf');return done('HTML text converted to PDF.')}
  if(id==='word-to-pdf'){if(!window.mammoth)throw new Error('Word library failed to load — check connection and retry.');const r=await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()});const doc=await textToPdfDoc(r.value,baseName(f));await saveDoc(doc,baseName(f)+'.pdf');return done('Word document converted (text-based Beta).')}
  if(id==='images-to-pdf'){const doc=await PDFDocument.create();const margin=parseFloat(opt('margin'))||0;const sizes={A4:[595,842],Letter:[612,792]};for(const file of files){const b=await bytes(file);const img=file.type.includes('png')||/\.png$/i.test(file.name)?await doc.embedPng(b):await doc.embedJpg(b);let pw,ph;if(opt('size')==='Fit image'){pw=img.width+margin*2;ph=img.height+margin*2}else{[pw,ph]=sizes[opt('size')]||sizes.A4}const page=doc.addPage([pw,ph]);const s=Math.min((pw-margin*2)/img.width,(ph-margin*2)/img.height);const w=img.width*s,h=img.height*s;page.drawImage(img,{x:(pw-w)/2,y:(ph-h)/2,width:w,height:h})}await saveDoc(doc,'aurelia-images.pdf');return done(files.length+' image(s) converted to PDF.')}
  // All remaining tools take a PDF first file
  const raw=await bytes(f);
  if(id==='pdf-to-text'){const pages=await extractText(raw);download(new Blob([pages.join('\n\n--- Page break ---\n\n')],{type:'text/plain'}),baseName(f)+'.txt');return done('Extracted text from '+pages.length+' page(s).')}
  if(id==='pdf-to-markdown'){const pages=await extractText(raw);download(new Blob([pages.map((p,i)=>'## Page '+(i+1)+'\n\n'+p).join('\n\n')],{type:'text/markdown'}),baseName(f)+'.md');return done('Markdown created.')}
  if(id==='summarize'){const pages=await extractText(raw);const text=pages.join(' ');const sents=text.match(/[^.!?]+[.!?]+/g)||[text];const freq={};text.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(/\s+/).forEach(w=>{if(w.length>3)freq[w]=(freq[w]||0)+1});const scored=sents.map((s,i)=>({s,i,score:s.toLowerCase().split(/\s+/).reduce((a,w)=>a+(freq[w.replace(/[^a-z0-9]/g,'')]||0),0)}));const top=scored.sort((a,b)=>b.score-a.score).slice(0,Math.min(7,sents.length)).sort((a,b)=>a.i-b.i).map(x=>x.s.trim());const out='SUMMARY — '+f.name+'\nPages: '+pages.length+' · Words: '+text.split(/\s+/).length+'\n\n'+top.map(s=>'• '+s).join('\n');download(new Blob([out],{type:'text/plain'}),baseName(f)+'-summary.txt');$('resultBox').insertAdjacentHTML('beforeend','<div class="glass" style="padding:16px;border-radius:16px;white-space:pre-wrap">'+out.replace(/</g,'&lt;')+'</div>');return done('Summary ready — computed locally, no AI server used.')}
  if(id==='compare'){if(files.length<2)throw new Error('Choose 2 PDFs to compare.');const a=(await extractText(await bytes(files[0]))).join('\n').split('\n'),b=(await extractText(await bytes(files[1]))).join('\n').split('\n');const setB=new Set(b),setA=new Set(a);const onlyA=a.filter(l=>l.trim()&&!setB.has(l)),onlyB=b.filter(l=>l.trim()&&!setA.has(l));const report='COMPARE REPORT\n'+files[0].name+' vs '+files[1].name+'\n\nLines only in FIRST ('+onlyA.length+'):\n'+onlyA.join('\n')+'\n\nLines only in SECOND ('+onlyB.length+'):\n'+onlyB.join('\n');download(new Blob([report],{type:'text/plain'}),'aurelia-compare.txt');return done('Comparison ready: '+onlyA.length+' / '+onlyB.length+' differing lines.')}
  if(id==='pdf-to-jpg'||id==='pdf-to-png'){const isPng=id==='pdf-to-png';const blobs=await renderPages(raw,parseFloat(opt('scale'))||2,isPng?'image/png':'image/jpeg',.92);await zipOut(blobs.map((b,i)=>({blob:b,name:baseName(f)+'-page-'+(i+1)+(isPng?'.png':'.jpg')})),baseName(f)+'-images.zip');return done(blobs.length+' page image(s) created.')}
  if(id==='compress'){const level=opt('level');const cfg={extreme:{s:.8,q:.45},recommended:{s:1.2,q:.65},low:{s:1.8,q:.85}}[level];const blobs=await renderPages(raw,cfg.s,'image/jpeg',cfg.q);const src=await PDFDocument.load(raw);const doc=await PDFDocument.create();for(let i=0;i<blobs.length;i++){const img=await doc.embedJpg(new Uint8Array(await blobs[i].arrayBuffer()));const sp=src.getPage(Math.min(i,src.getPageCount()-1));const page=doc.addPage([sp.getWidth(),sp.getHeight()]);page.drawImage(img,{x:0,y:0,width:page.getWidth(),height:page.getHeight()})}const outBytes=await doc.save();download(new Blob([outBytes],{type:'application/pdf'}),baseName(f)+'-compressed.pdf');return done('Compressed ('+level+'): '+fmt(raw.length)+' → '+fmt(outBytes.length)+'. Note: image-based output — text becomes part of the page image.')}
  if(id==='ocr'){const max=parseInt(opt('pages'))||5;const pdf=await pdfjsLib.getDocument({data:raw.slice()}).promise;const n=Math.min(max,pdf.numPages);let allText='';for(let i=1;i<=n;i++){setProg(i/n*.8);const pg=await pdf.getPage(i);const vp=pg.getViewport({scale:2});const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;const res=await Tesseract.recognize(c,'eng');allText+='\n\n--- Page '+i+' ---\n'+res.data.text}const doc=await textToPdfDoc(allText,baseName(f)+' OCR');await saveDoc(doc,baseName(f)+'-ocr.pdf');download(new Blob([allText],{type:'text/plain'}),baseName(f)+'-ocr.txt');return done('OCR finished for '+n+' page(s). PDF + text downloaded.')}
  if(id==='pdf-to-word'){const pages=await extractText(raw);download(await makeDocx(pages,baseName(f)),baseName(f)+'.docx');return done('Word file created (Beta, text-based).')}
  if(id==='pdf-to-excel'){const pages=await extractText(raw);const rows=[];pages.forEach((p,pi)=>p.split('\n').forEach(l=>rows.push(['Page '+(pi+1),l])));if(window.XLSX){const ws=XLSX.utils.aoa_to_sheet([['Page','Text'],...rows]);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Extracted');const out=XLSX.write(wb,{bookType:'xlsx',type:'array'});download(new Blob([out],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),baseName(f)+'.xlsx')}else{download(new Blob([rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n')],{type:'text/csv'}),baseName(f)+'.csv')}return done('Spreadsheet created (Beta).')}
  if(id==='unlock'){
    // Path 1: permission-only encryption — pdf-lib can strip it directly (text preserved)
    try{const d=await PDFDocument.load(raw,{ignoreEncryption:true});const outBytes=await d.save();await pdfjsLib.getDocument({data:outBytes.slice()}).promise;download(new Blob([outBytes],{type:'application/pdf'}),baseName(f)+'-unlocked.pdf');return done('Unlocked — saved without encryption, text preserved.')}catch(e){/* fall through to password path */}
    // Path 2: user-password encryption — open with the owner's password via PDF.js and rebuild
    const pw=opt('password'); if(!pw)throw new Error('This PDF needs its password. Enter the current password (you must be its owner / authorised) and retry.');
    const pdf=await pdfjsLib.getDocument({data:raw.slice(),password:pw}).promise;
    const doc2=await PDFDocument.create();
    for(let i=1;i<=pdf.numPages;i++){const pg=await pdf.getPage(i);const vp=pg.getViewport({scale:2});const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));const img=await doc2.embedJpg(new Uint8Array(await blob.arrayBuffer()));const base=pg.getViewport({scale:1});const page=doc2.addPage([base.width,base.height]);page.drawImage(img,{x:0,y:0,width:base.width,height:base.height})}
    await saveDoc(doc2,baseName(f)+'-unlocked.pdf');return done('Unlocked with your password and rebuilt without encryption. Note: rebuilt pages are images (text not selectable).')}
  // pdf-lib tools
  const doc=await PDFDocument.load(raw,{ignoreEncryption:id==='repair'});
  const total=doc.getPageCount();
  if(id==='split'){const items=[];if(opt('mode')==='pick'){const idx=(pm&&pm.mode==='pick'&&pm.sel.size)?[...pm.sel].sort((a,b)=>a-b):(parseRanges(opt('ranges'),total)||[]);if(!idx.length)throw new Error('Tap pages in the preview above to pick them first.');const d=await PDFDocument.create();(await d.copyPages(doc,idx)).forEach(p=>d.addPage(p));await saveDoc(d,baseName(f)+'-picked.pdf');return done('Extracted '+idx.length+' picked page(s) as one PDF.')}if(opt('mode')==='each'){for(let i=0;i<total;i++){const d=await PDFDocument.create();const [p]=await d.copyPages(doc,[i]);d.addPage(p);items.push({blob:new Blob([await d.save()],{type:'application/pdf'}),name:baseName(f)+'-page-'+(i+1)+'.pdf'})}}else{const ranges=opt('ranges').split(',').map(s=>s.trim()).filter(Boolean);for(let r=0;r<ranges.length;r++){const idx=parseRanges(ranges[r],total);if(!idx)continue;const d=await PDFDocument.create();(await d.copyPages(doc,idx)).forEach(p=>d.addPage(p));items.push({blob:new Blob([await d.save()],{type:'application/pdf'}),name:baseName(f)+'-part-'+(r+1)+'.pdf'})}}if(!items.length)throw new Error('No valid ranges.');await zipOut(items,baseName(f)+'-split.zip');return done('Split into '+items.length+' file(s).')}
  if(id==='remove-pages'){const rm=new Set((pm&&pm.mode==='remove'&&pm.sel.size)?[...pm.sel]:(parseRanges(opt('pages'),total)||[]));if(!rm.size)throw new Error('Tap pages in the preview above to mark them for removal — or type page numbers.');if(rm.size>=total)throw new Error('You cannot remove every page.');[...rm].sort((a,b)=>b-a).forEach(i=>doc.removePage(i));await saveDoc(doc,baseName(f)+'-trimmed.pdf');return done('Removed '+rm.size+' page(s). '+doc.getPageCount()+' remain.')}
  if(id==='extract-pages'){const idx=(pm&&pm.mode==='extract'&&pm.sel.size)?[...pm.sel].sort((a,b)=>a-b):parseRanges(opt('pages'),total);if(!idx||!idx.length)throw new Error('Tap pages in the preview above — or type valid page numbers.');const d=await PDFDocument.create();(await d.copyPages(doc,idx)).forEach(p=>d.addPage(p));await saveDoc(d,baseName(f)+'-extract.pdf');return done('Extracted '+idx.length+' page(s).')}
  if(id==='organize'){const idx=(pm&&pm.mode==='organize')?pm.order.slice():parseRanges(opt('order'),total);if(!idx||idx.length!==total)throw new Error('Order must list every page exactly once (1 to '+total+').');const d=await PDFDocument.create();(await d.copyPages(doc,idx)).forEach(p=>d.addPage(p));await saveDoc(d,baseName(f)+'-reordered.pdf');return done('Pages reordered.')}
  if(id==='rotate'){if(pm&&pm.mode==='rotate'&&Object.values(pm.rot).some(a=>a)){let n=0;Object.entries(pm.rot).forEach(([i,a])=>{if(!a)return;const p=doc.getPage(+i);p.setRotation(degrees((p.getRotation().angle+a)%360));n++});await saveDoc(doc,baseName(f)+'-rotated.pdf');return done('Rotated '+n+' page(s) from the thumbnails.')}const idx=opt('pages').trim()?(parseRanges(opt('pages'),total)||[]):doc.getPageIndices();idx.forEach(i=>{const p=doc.getPage(i);p.setRotation(degrees((p.getRotation().angle+parseInt(opt('angle')))%360))});await saveDoc(doc,baseName(f)+'-rotated.pdf');return done('Rotated '+idx.length+' page(s).')}
  if(id==='crop'){doc.getPages().forEach(p=>{const {width,height}=p.getSize();const l=+opt('left')||0,r=+opt('right')||0,t=+opt('top')||0,b=+opt('bottom')||0;p.setCropBox(l,b,Math.max(50,width-l-r),Math.max(50,height-t-b))});await saveDoc(doc,baseName(f)+'-cropped.pdf');return done('Cropped all pages.')}
  if(id==='repair'){await saveDoc(doc,baseName(f)+'-repaired.pdf');return done('Repaired / cleanly re-saved. Pages: '+total+'. If the original was severely corrupt, some content may be missing.')}
  if(id==='page-numbers'){const font=await doc.embedFont(StandardFonts.Helvetica);const pos=opt('position'),fmtOpt=opt('format');doc.getPages().forEach((p,i)=>{const {width,height}=p.getSize();const label=fmtOpt==='n'?String(i+1):fmtOpt==='Page n'?'Page '+(i+1):(i+1)+' / '+total;const w=font.widthOfTextAtSize(label,10);let x=width/2-w/2,y=24;if(pos.includes('right'))x=width-w-36;if(pos.includes('left'))x=36;if(pos.startsWith('top'))y=height-30;p.drawText(label,{x,y,size:10,font,color:rgb(.25,.25,.25)})});await saveDoc(doc,baseName(f)+'-numbered.pdf');return done('Page numbers added.')}
  if(id==='watermark'){const font=await doc.embedFont(StandardFonts.HelveticaBold);const text=opt('text')||'AURELIA';const size=parseFloat(opt('size'))||42;const op=Math.min(.6,Math.max(.05,parseFloat(opt('opacity'))||.18));doc.getPages().forEach(p=>{const {width,height}=p.getSize();p.drawText(text,{x:width/2-font.widthOfTextAtSize(text,size)/2,y:height/2,size,font,color:rgb(.55,.6,.7),opacity:op,rotate:degrees(35)})});await saveDoc(doc,baseName(f)+'-watermarked.pdf');return done('Watermark added.')}
  if(id==='edit-pdf'||id==='annotate'){let pi=(parseInt(opt('page'))||1)-1;let px=50,py=700,rect=null;
    if(ed&&ed.kind===id){if(id==='edit-pdf'&&ed.marker){pi=ed.marker.page;const s=doc.getPage(pi).getSize();px=ed.marker.fx*s.width;py=s.height-ed.marker.fy*s.height}
      if(id==='annotate'&&ed.rect){pi=ed.rect.page;const s=doc.getPage(pi).getSize();rect={x:ed.rect.fx*s.width,y:s.height-(ed.rect.fy+ed.rect.fh)*s.height,w:ed.rect.fw*s.width,h:ed.rect.fh*s.height}}}
    if(pi<0||pi>=total)throw new Error('Page out of range.');const p=doc.getPage(pi);const font=await doc.embedFont(StandardFonts.Helvetica);const text=opt('text')||'';
    if(id==='annotate'){const w=rect?rect.w:Math.max(120,font.widthOfTextAtSize(text,11)+20),h=rect?rect.h:30,x=rect?rect.x:50,y=rect?rect.y:650;p.drawRectangle({x,y,width:w,height:h,color:rgb(1,.93,.55),opacity:.95});p.drawText(text,{x:x+10,y:rect?y+h-16:y+10,size:11,font,color:rgb(.05,.05,.05),maxWidth:Math.max(40,w-16)});await saveDoc(doc,baseName(f)+'-annotated.pdf');return done('Note added to page '+(pi+1)+(rect?' where you drew it.':'.'))}
    p.drawText(text,{x:px,y:py,size:parseFloat(opt('size'))||18,font,color:rgb(.05,.05,.05)});await saveDoc(doc,baseName(f)+'-edited.pdf');return done('Text added to page '+(pi+1)+(ed&&ed.marker?' where you clicked.':'.'))}
  if(id==='sign-pdf'){if(!sigDrawn)throw new Error('Draw your signature in the pad first — then drag it into place on the preview.');const c=$('sigpad');const b=await new Promise(r=>c.toBlob(r,'image/png'));const img=await doc.embedPng(new Uint8Array(await b.arrayBuffer()));
    let pi=total-1,x=null,y=null,wPt=180;const aspect=c.height/c.width;
    if(ed&&ed.kind==='sign-pdf'){pi=Math.min(ed.page,total-1);const s=doc.getPage(pi).getSize();wPt=ed.signW*s.width;x=ed.signPos.fx*s.width;y=s.height-ed.signPos.fy*s.height-wPt*aspect}
    const p=doc.getPage(pi);const s2=p.getSize();if(x===null){x=Math.max(20,s2.width-wPt-40);y=60}
    p.drawImage(img,{x,y,width:wPt,height:wPt*aspect});await saveDoc(doc,baseName(f)+'-signed.pdf');return done('Signature stamped on page '+(pi+1)+' where you placed it.')}
  if(id==='redact'){if(ed&&ed.kind==='redact'&&ed.boxes.length){ed.boxes.forEach(bx=>{if(bx.page<0||bx.page>=total)return;const p=doc.getPage(bx.page);const s=p.getSize();p.drawRectangle({x:bx.fx*s.width,y:s.height-(bx.fy+bx.fh)*s.height,width:bx.fw*s.width,height:bx.fh*s.height,color:rgb(0,0,0)})});await saveDoc(doc,baseName(f)+'-redacted.pdf');return done(ed.boxes.length+' area(s) covered. Note: cover boxes are visual — flatten/verify before sharing highly sensitive files.')}
    const pi=(parseInt(opt('page'))||1)-1;if(pi<0||pi>=total)throw new Error('Page out of range.');doc.getPage(pi).drawRectangle({x:50,y:600,width:220,height:40,color:rgb(0,0,0)});await saveDoc(doc,baseName(f)+'-redacted.pdf');return done('Default area covered on page '+(pi+1)+'. Tip: drag on the preview to place boxes exactly. Note: cover box is visual — flatten/verify before sharing highly sensitive files.')}
  if(id==='metadata'){const before={Title:doc.getTitle()||'',Author:doc.getAuthor()||'',Subject:doc.getSubject()||'',Keywords:doc.getKeywords()||''};if(opt('title'))doc.setTitle(opt('title'));if(opt('author'))doc.setAuthor(opt('author'));if(opt('subject'))doc.setSubject(opt('subject'));if(opt('keywords'))doc.setKeywords(opt('keywords').split(',').map(s=>s.trim()));await saveDoc(doc,baseName(f)+'-metadata.pdf');$('resultBox').insertAdjacentHTML('beforeend','<div class="glass" style="padding:14px;border-radius:14px">Previous metadata: '+JSON.stringify(before).replace(/</g,'&lt;')+'</div>');return done('Metadata updated (blank fields were left unchanged).')}
  if(id==='protect'){if(!opt('password'))throw new Error('Enter a password.');if(opt('password')!==opt('confirm'))throw new Error('Passwords do not match.');if(typeof doc.encrypt!=='function')throw new Error('Encryption engine unavailable in this build.');doc.encrypt({userPassword:opt('password'),ownerPassword:opt('password'),permissions:{printing:'highResolution',modifying:false,copying:false,annotating:false,fillingForms:false,contentAccessibility:true,documentAssembly:false}});await saveDoc(doc,baseName(f)+'-protected.pdf');return done('PDF encrypted with your password. Keep it safe — it cannot be recovered here.')}
  if(id==='unlock'){throw new Error('Unlock is handled earlier in the pipeline.')}
  throw new Error('Unknown tool.');
}
async function makeDocx(pages,title){
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const paras=pages.map(p=>p.split('\n').map(l=>`<w:p><w:r><w:t xml:space="preserve">${esc(l)}</w:t></w:r></w:p>`).join('')).join('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  const docXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}</w:body></w:document>`;
  const zip=new JSZip();zip.file('[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.folder('_rels').file('.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.folder('word').file('document.xml',docXml);
  return zip.generateAsync({type:'blob'});
}
renderTools();
