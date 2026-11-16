/* AURELIA — 100% client-side PDF tools. No uploads. */
'use strict';
if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;

const F=(key,label,type='text',def='',extra={})=>({key,label,type,def,...extra});
const O=(v,l)=>({v,l}); // select option with separate value/label
const TOOLS=[
 // Organize
 {id:'merge',cat:'Organize',icon:'combine',name:'Merge PDF',desc:'Combine multiple PDFs into one, in the order you arrange them.',accept:'.pdf',multiple:true},
 {id:'split',cat:'Organize',icon:'scissors',name:'Split PDF',desc:'Split by page ranges, into one PDF per page, or tap pages to pull them out together.',accept:'.pdf',opts:[F('mode','How to split','select','ranges',{options:[O('ranges','By page ranges'),O('each','Every page as its own PDF'),O('pick','Pick pages (tap below)')]}),F('ranges','Ranges (for “By page ranges”, e.g. 1-3, 4-6)','text','1-')]},
 {id:'remove-pages',cat:'Organize',icon:'file-x-2',name:'Remove Pages',desc:'Tap page thumbnails to choose the pages to delete.',accept:'.pdf',opts:[F('pages','Pages to remove (e.g. 2, 4-5)','text','')]},
 {id:'extract-pages',cat:'Organize',icon:'file-output',name:'Extract Pages',desc:'Tap page thumbnails to choose the pages to pull out into a new PDF.',accept:'.pdf',opts:[F('pages','Pages to extract (e.g. 1, 3-5)','text','')]},
 {id:'organize',cat:'Organize',icon:'layers',name:'Organize / Reorder',desc:'Drag page thumbnails into a new order, remove pages, or add a blank page.',accept:'.pdf',opts:[F('order','New order (e.g. 3,1,2)','text','')]},
 {id:'rotate',cat:'Organize',icon:'rotate-cw',name:'Rotate PDF',desc:'Tap [[rotate-cw]] on any page thumbnail to rotate just that page — or rotate every page at once.',accept:'.pdf',opts:[F('angle','Angle (for rotate-all)','select','90',{options:['90','180','270']}),F('pages','Pages for rotate-all (blank = all)','text','')]},
 {id:'crop',cat:'Organize',icon:'crop',name:'Crop PDF',desc:'Drag the crop rectangle on the preview. The same trim is applied to every page.',accept:'.pdf',opts:[F('left','Left trim','number','36'),F('right','Right trim','number','36'),F('top','Top trim','number','36'),F('bottom','Bottom trim','number','36')]},
 // Optimize
 {id:'compress',cat:'Optimize',icon:'minimize-2',name:'Compress PDF',desc:'Re-encode pages to shrink file size. Choose your level.',accept:'.pdf',opts:[F('level','Level','select','recommended',{options:[O('recommended','Recommended — good quality, much smaller'),O('extreme','Extreme — smallest file, lower quality'),O('low','Light — best quality, a bit smaller')]})]},
 {id:'repair',cat:'Optimize',icon:'wrench',name:'Repair PDF',desc:'Load and cleanly re-save a damaged PDF. If a file is too damaged to fix, we will tell you plainly.',accept:'.pdf'},
 {id:'ocr',cat:'Optimize',icon:'scan-text',name:'OCR PDF',desc:'Recognise text in scanned PDFs and build a searchable text PDF. English only; the first run downloads the language data once. Slow for large files.',accept:'.pdf',note:'Best effort — English OCR in-browser',opts:[F('pages','Max pages to OCR','number','5')]},
 // Convert to PDF
 {id:'images-to-pdf',cat:'Convert to PDF',icon:'images',name:'Images to PDF',desc:'Convert JPG & PNG images into one polished PDF.',accept:'.jpg,.jpeg,.png',multiple:true,opts:[F('size','Page size','select','A4',{options:['A4','Letter','Fit image']}),F('margin','Margin around each image','select','18',{options:[O('0','No margin'),O('18','Small'),O('36','Comfortable')]})]},
 {id:'html-to-pdf',cat:'Convert to PDF',icon:'globe',name:'HTML to PDF',desc:'Upload an .html file — its text becomes a clean PDF. Text-based (Beta) — layout is simplified.',accept:'.html,.htm',note:'Beta — text-based, layout is simplified'},
 {id:'word-to-pdf',cat:'Convert to PDF',icon:'file-type-2',name:'Word to PDF',desc:'Convert a .docx file into a PDF. Text-based (Beta) — layout is simplified.',accept:'.docx',note:'Beta — text-based, layout is simplified'},
 {id:'text-to-pdf',cat:'Convert to PDF',icon:'type',name:'Text to PDF',desc:'Turn a .txt file into a formatted PDF.',accept:'.txt'},
 // Convert from PDF
 {id:'pdf-to-jpg',cat:'Convert from PDF',icon:'image',name:'PDF to JPG',desc:'Turn each page into a JPG image (ZIP if there are many).',accept:'.pdf',opts:[F('scale','Image quality','select','2',{options:[O('1','Standard — smaller files'),O('2','High — recommended'),O('3','Maximum — largest files')]})]},
 {id:'pdf-to-png',cat:'Convert from PDF',icon:'image-down',name:'PDF to PNG',desc:'Turn each page into a crisp PNG image (ZIP if there are many).',accept:'.pdf',opts:[F('scale','Image quality','select','2',{options:[O('1','Standard — smaller files'),O('2','High — recommended'),O('3','Maximum — largest files')]})]},
 {id:'pdf-to-text',cat:'Convert from PDF',icon:'align-left',name:'PDF to Text',desc:'Extract all readable text as a .txt file.',accept:'.pdf'},
 {id:'pdf-to-word',cat:'Convert from PDF',icon:'file-text',name:'PDF to Word',desc:'Extract the text into an editable .docx file. Text-based (Beta) — layout is simplified.',accept:'.pdf',note:'Beta — text-based, layout is simplified'},
 {id:'pdf-to-excel',cat:'Convert from PDF',icon:'table-2',name:'PDF to Excel',desc:'Turn PDF text into a spreadsheet (.xlsx): one row per line, split into columns where the spacing allows. Beta — table layout is not preserved.',accept:'.pdf',note:'Beta — text into rows/columns, table layout not preserved'},
 {id:'pdf-to-markdown',cat:'Convert from PDF',icon:'file-code-2',name:'PDF to Markdown',desc:'Extract text as Markdown, page by page. Text-based (Beta) — structure is approximate.',accept:'.pdf',note:'Beta — text-based, structure is approximate'},
 // Edit
 {id:'edit-pdf',cat:'Edit',icon:'pen-line',name:'Add Text to PDF',desc:'Click on the page preview to place your text exactly there. (This adds new text — existing text in the PDF can\'t be changed in the browser.)',accept:'.pdf',opts:[F('text','Text to add','text','',{placeholder:'Type the text to add…'}),F('page','Page number','number','1'),F('size','Font size','number','18')]},
 {id:'annotate',cat:'Edit',icon:'sticky-note',name:'Annotate PDF',desc:'Drag a rectangle on the page preview to place a highlighted note, stamped onto the page.',accept:'.pdf',opts:[F('text','Note text','text','',{placeholder:'Type your note…'}),F('page','Page number','number','1')]},
 {id:'page-numbers',cat:'Edit',icon:'hash',name:'Add Page Numbers',desc:'Stamp page numbers on every page — tap a square to choose where they go.',accept:'.pdf',opts:[F('position','Position','posgrid','bottom-right'),F('format','Number style','select','n',{options:[O('n','Just the number (1, 2, 3…)'),O('Page n','Page 1, Page 2…'),O('n / total','1 / 14, 2 / 14…')]}),F('first','First number','number','1')]},
 {id:'watermark',cat:'Edit',icon:'stamp',name:'Watermark',desc:'Add a translucent text watermark — tap a square to choose where it sits.',accept:'.pdf',opts:[F('text','Watermark text','text','CONFIDENTIAL'),F('position','Position','posgrid','center'),F('opacity','Strength','select','0.18',{options:[O('0.1','Light — faint'),O('0.18','Medium'),O('0.35','Strong')]}),F('size','Font size','number','42')]},
 {id:'sign-pdf',cat:'Edit',icon:'signature',name:'Sign PDF',desc:'Draw, type or upload your signature, then drag it anywhere on any page preview.',accept:'.pdf',sig:true},
 {id:'redact',cat:'Edit',icon:'eye-off',name:'Redact PDF',desc:'Drag rectangles on the page preview to permanently black out sensitive areas. Pages with boxes are flattened into images, so the hidden text is truly removed — not just covered.',accept:'.pdf',opts:[F('page','Page number','number','1')]},
 // Security
 {id:'protect',cat:'Security',icon:'lock',name:'Protect PDF',desc:'Encrypt your PDF with a password you choose. There is no recovery if you forget it — keep it safe.',accept:'.pdf',opts:[F('password','Password','password',''),F('confirm','Confirm password','password','')]},
 {id:'unlock',cat:'Security',icon:'lock-open',name:'Unlock PDF',desc:'Remove password protection from a PDF you own. If the file has an open password, you will need to enter it — protection can\'t (and shouldn\'t) be bypassed without it.',accept:'.pdf',note:'Works on permission-protected files, and on password files when you know the password',opts:[F('password','Current password (if the file asks for one)','password','')]},
 {id:'metadata',cat:'Security',icon:'tags',name:'Metadata Editor',desc:'See and edit the title, author, subject & keywords stored inside your PDF.',accept:'.pdf',opts:[F('title','Title','text',''),F('author','Author','text',''),F('subject','Subject','text',''),F('keywords','Keywords (comma separated)','text',''),F('clearmeta','Clear all metadata instead','checkbox','')]},
 // Other
 {id:'compare',cat:'Compare & AI',icon:'git-compare-arrows',name:'Compare PDF',desc:'Upload 2 PDFs — get a text difference report. (If you add more, the first two are compared.)',accept:'.pdf',multiple:true},
 {id:'summarize',cat:'Compare & AI',icon:'sparkles',name:'Summarize PDF',desc:'Local extractive summary — picks the key sentences from the document itself. No AI server, no upload.',accept:'.pdf',note:'Extractive summary runs 100% locally'},
];
let current=null, files=[];
const $=id=>document.getElementById(id);
function toast(m){const t=$('toast');t.textContent=m;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),4200)}
function showHome(){$('homeView').classList.remove('hidden');$('toolView').classList.add('hidden');window.scrollTo({top:0,behavior:'smooth'})}
function fmt(n){return n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB'}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const icon=(n,s=20)=>`<svg class="ic" width="${s}" height="${s}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const expandDesc=d=>d.replace(/\[\[([\w-]+)\]\]/g,(m,n)=>icon(n,14));
const pillHTML=note=>{if(!note)return '';const txt=note.split('—')[0].trim();const cls=txt.split(/\s+/).filter(Boolean).length<=3?'pill tag':'pill';return `<span class="${cls}">${txt}</span>`};
const POPULAR=['merge','compress','pdf-to-jpg','images-to-pdf'];
function renderTools(filter=''){
  const cats=[...new Set(TOOLS.map(t=>t.cat))]; let html='';
  if(!filter){const pop=POPULAR.map(id=>TOOLS.find(t=>t.id===id)).filter(Boolean);
    html+=`<section class="cat"><h2>${icon('flame',22)} Most popular</h2><p>The everyday tools — one tap away</p><div class="grid">${pop.map(t=>`<button class="card glass" onclick="openTool('${t.id}')"><div class="icchip"><span class="ic-in">${icon(t.icon,24)}</span></div><h3>${t.name}</h3><p>${expandDesc(t.desc)}</p>${pillHTML(t.note)}</button>`).join('')}</div></section>`}
  cats.forEach(c=>{const list=TOOLS.filter(t=>t.cat===c&&(t.name+' '+t.desc).toLowerCase().includes(filter.toLowerCase())); if(!list.length)return;
    html+=`<section class="cat"><h2>${c}</h2><p>${list.length} tool(s)</p><div class="grid">${list.map(t=>`<button class="card glass" onclick="openTool('${t.id}')"><div class="icchip"><span class="ic-in">${icon(t.icon,24)}</span></div><h3>${t.name}</h3><p>${expandDesc(t.desc)}</p>${pillHTML(t.note)}</button>`).join('')}</div></section>`});
  $('tools').innerHTML=html||'<p style="text-align:center;color:var(--muted)">No tools match your search.</p>';
}
$('searchInput').addEventListener('input',e=>renderTools(e.target.value));
$('themeBtn').addEventListener('click',()=>{const h=document.documentElement;const d=h.dataset.theme!=='dark';h.dataset.theme=d?'dark':'light';$('themeBtn').innerHTML=icon(d?'sun':'moon',16)+' '+(d?'Light':'Dark')});

/* ================= Job / progress system (v3) =================
   Every run goes through startJob/endJob: the button locks with a
   "Working…" label (no double-runs, no lost clicks with zero feedback),
   long jobs report real per-page progress, OCR + page loops can be
   cancelled, and ANY failure — sync or async — surfaces a friendly
   error and unlocks the button. A watchdog keeps the user informed
   instead of staring at a frozen bar. */
let busy=false, jobCancelled=false, jobWatchdog=null, ocrWorker=null, ocrCancelReject=null;
const JOB_LABELS={'merge':'Merging PDFs…','split':'Splitting PDF…','remove-pages':'Removing pages…','extract-pages':'Extracting pages…','organize':'Reordering pages…','rotate':'Rotating pages…','crop':'Cropping PDF…','compress':'Compressing PDF…','repair':'Repairing PDF…','ocr':'Reading text (OCR)…','images-to-pdf':'Building your PDF…','html-to-pdf':'Converting HTML…','word-to-pdf':'Converting Word file…','text-to-pdf':'Converting text…','pdf-to-jpg':'Converting pages to JPG…','pdf-to-png':'Converting pages to PNG…','pdf-to-text':'Extracting text…','pdf-to-word':'Converting to Word…','pdf-to-excel':'Building spreadsheet…','pdf-to-markdown':'Converting to Markdown…','edit-pdf':'Adding your text…','annotate':'Adding your note…','page-numbers':'Adding page numbers…','watermark':'Adding watermark…','sign-pdf':'Stamping your signature…','redact':'Redacting — flattening pages…','protect':'Encrypting PDF…','unlock':'Unlocking PDF…','metadata':'Saving metadata…','compare':'Comparing PDFs…','summarize':'Summarising…'};
function cancelError(){const e=new Error('Cancelled.');e.__cancelled=true;return e}
function setProg(p,text){const w=$('progWrap');if(w)w.classList.remove('hidden');if(typeof p==='number')$('progBar').style.width=Math.round(Math.min(1,Math.max(0,p))*100)+'%';if(text)$('progText').textContent=text}
function tick(i,total,label){if(jobCancelled)throw cancelError();if(total>0)setProg(.05+.9*(i/total),(label||'Working')+' — '+i+' of '+total)}
function startJob(){busy=true;jobCancelled=false;const btn=$('processBtn');btn.disabled=true;btn.classList.remove('pulse');btn.textContent='Working…';$('resultBox').innerHTML='';setProg(.03,JOB_LABELS[current.id]||'Working…');$('status').textContent=JOB_LABELS[current.id]||'Working locally in your browser…';
  const cb=$('cancelBtn');if(cb)cb.classList.toggle('hidden',!CANCELLABLE.has(current.id));
  clearTimeout(jobWatchdog);jobWatchdog=setTimeout(()=>{if(busy)$('status').textContent='Still working — large files can take a while on this device. You can keep waiting, or Cancel and try a smaller file.'},45000)}
function endJob(){$('cancelBtn')&&$('cancelBtn').classList.add('hidden');busy=false;clearTimeout(jobWatchdog);const btn=$('processBtn');btn.disabled=false;updateActionLabel()}
const CANCELLABLE=new Set(['compress','pdf-to-jpg','pdf-to-png','ocr','images-to-pdf','unlock','pdf-to-word','pdf-to-excel','pdf-to-text','pdf-to-markdown','summarize','compare']);
$('cancelBtn').addEventListener('click',()=>{jobCancelled=true;$('status').textContent='Cancelling…';if(ocrWorker){const w=ocrWorker;ocrWorker=null;try{w.terminate()}catch(e){}}if(ocrCancelReject){const r=ocrCancelReject;ocrCancelReject=null;r(cancelError())}});
window.addEventListener('unhandledrejection',e=>{if(busy){const fe=friendlyError(e.reason);setErrorStatus(fe);setProg(0);$('progWrap').classList.add('hidden');endJob()}});
function setErrorStatus(fe){$('status').innerHTML=icon('triangle-alert',16)+' '+esc(fe)}
function friendlyError(e){const m=(e&&e.message)||'';
  if(e&&e.__cancelled)return 'Cancelled — nothing was changed.';
  if(!m.trim())return 'Something went wrong with that file. Please try a different PDF — or a smaller, simpler one.';
  if(/Incorrect password|PasswordException|Invalid password/i.test(m))return 'That password didn\'t work. Check it and try again.';
  if(/No password given/i.test(m))return 'This PDF needs its password — enter it above and try again.';
  if(m.length<140&&!/TypeError|Cannot read|Cannot access|undefined is|null is|is not a function|NetworkError|Failed to fetch|Failed to parse|Invalid PDF|No PDF header|offset|line:\s?\d|col:\s?\d|pdf-lib|EncryptedPDF|stack|https?:\/\/|fake worker|load script|importScripts/i.test(m))return m;
  return 'Something went wrong with that file. Please try a different PDF — or a smaller, simpler one.'}

/* ================= Tool setup & options ================= */
function optFieldHTML(o){
  if(o.type==='select')return `<div class="field"><label>${o.label}</label><select id="opt_${o.key}">${o.options.map(v=>{const val=typeof v==='object'?v.v:v,lab=typeof v==='object'?v.l:v;return `<option value="${esc(val)}" ${val===o.def?'selected':''}>${esc(lab)}</option>`}).join('')}</select></div>`;
  if(o.type==='posgrid')return `<div class="field"><label>${o.label}</label><div class="posgrid" id="posgrid_${o.key}" role="radiogroup" aria-label="${o.label}"></div><input type="hidden" id="opt_${o.key}" value="${o.def}"><p class="pos-sentence" id="possent_${o.key}"></p></div>`;
  if(o.type==='checkbox')return `<div class="field"><label class="checkline"><input id="opt_${o.key}" type="checkbox"> ${o.label}</label></div>`;
  if(o.type==='password')return `<div class="field"><label>${o.label}</label><div class="pwwrap"><input id="opt_${o.key}" type="password" value="" autocomplete="new-password"><button type="button" class="eye" data-eye="${o.key}" aria-label="Show or hide password">${icon('eye',18)}</button></div><div id="pwhelp_${o.key}"></div></div>`;
  return `<div class="field"><label>${o.label}</label><input id="opt_${o.key}" type="${o.type}" value="${o.def||''}" placeholder="${o.placeholder||o.label}"></div>`;
}
const POS_WORDS={'top-left':'top left','top-center':'top centre','top-right':'top right','middle-left':'middle left','center':'centre','middle-right':'middle right','bottom-left':'bottom left','bottom-center':'bottom centre','bottom-right':'bottom right'};
const POS_DOTS={'top-left':[4,4],'top-center':[50,4],'top-right':[96,4],'middle-left':[4,50],'center':[50,50],'middle-right':[96,50],'bottom-left':[4,96],'bottom-center':[50,96],'bottom-right':[96,96]};
function buildPosGrid(o){const g=$('posgrid_'+o.key);if(!g)return;g.innerHTML=Object.keys(POS_DOTS).map(v=>{const[x,y]=POS_DOTS[v];return `<button type="button" role="radio" aria-checked="${v===o.def}" data-pos="${v}" class="${v===o.def?'sel':''}" title="${POS_WORDS[v]}"><span class="dot" style="left:calc(${x}% - 4px);top:calc(${y}% - 4px)"></span></button>`}).join('');
  g.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{g.querySelectorAll('button').forEach(x=>{x.classList.remove('sel');x.setAttribute('aria-checked','false')});b.classList.add('sel');b.setAttribute('aria-checked','true');$('opt_'+o.key).value=b.dataset.pos;updatePosSentence(o.key)}));updatePosSentence(o.key)}
function updatePosSentence(key){const s=$('possent_'+key);if(!s||!current)return;const v=opt(key);if(current.id==='page-numbers')s.textContent='Number '+(parseInt(opt('first'))||1)+' will be placed on '+POS_WORDS[v]+' of the first page.';else if(current.id==='watermark')s.textContent='The watermark will sit at the '+POS_WORDS[v]+' of every page.'}
function wirePasswordWidgets(){document.querySelectorAll('[data-eye]').forEach(b=>b.addEventListener('click',()=>{const inp=$('opt_'+b.dataset.eye);if(inp){inp.type=inp.type==='password'?'text':'password';b.innerHTML=icon(inp.type==='text'?'eye-off':'eye',18)}}));
  if(current.id!=='protect')return;const pw=$('opt_password'),cf=$('opt_confirm'),help=$('pwhelp_password');
  if(help)help.innerHTML='<ul class="strength"><li data-k="len">At least 8 characters</li><li data-k="num">A number</li><li data-k="up">An UPPERCASE letter</li><li data-k="low">a lowercase letter</li></ul>';
  const check=()=>{const v=pw.value;const rules={len:v.length>=8,num:/\d/.test(v),up:/[A-Z]/.test(v),low:/[a-z]/.test(v)};if(help)help.querySelectorAll('li').forEach(li=>li.classList.toggle('ok',!!rules[li.dataset.k]));
    const ch=$('pwhelp_confirm');if(ch){if(cf.value&&v!==cf.value)ch.innerHTML='<div class="pwmatch bad">Passwords don\'t match yet</div>';else if(cf.value&&v===cf.value)ch.innerHTML='<div class="pwmatch good">'+icon('check',14)+' Passwords match</div>';else ch.innerHTML=''}};
  if(pw)pw.addEventListener('input',check);if(cf)cf.addEventListener('input',check)}
function openTool(id){current=TOOLS.find(t=>t.id===id);files=[];metaLoaded=false;$('homeView').classList.add('hidden');$('toolView').classList.remove('hidden');
  $('toolTitle').innerHTML='<span class="title-ic">'+icon(current.icon,24)+'</span>'+esc(current.name);$('toolDesc').innerHTML=expandDesc(current.desc);
  const n=$('toolNote'); if(current.note){n.textContent=current.note;n.classList.toggle('tag',current.note.trim().split(/\s+/).length<=3);n.classList.remove('hidden')}else n.classList.add('hidden');
  $('fileInput').accept=current.accept;$('fileInput').multiple=!!current.multiple;
  $('acceptHint').textContent='Accepts: '+current.accept+(current.multiple?' · multiple files':' · single file');
  $('sigWrap').classList.toggle('hidden',!current.sig); if(current.sig) initSig();
  let optsHtml=(current.opts||[]).map(optFieldHTML).join('');
  if(current.id==='metadata')optsHtml='<div class="meta-view" id="metaView">Choose a PDF above — its current title, author, subject & keywords will appear here, ready to edit.</div>'+optsHtml;
  $('toolOpts').innerHTML=optsHtml;
  (current.opts||[]).filter(o=>o.type==='posgrid').forEach(buildPosGrid);
  wirePasswordWidgets();
  if(current.id==='split'){const m=$('opt_mode');if(m)m.addEventListener('change',()=>{updateActionLabel();refreshToolInfo()})}
  if(current.id==='page-numbers'){const fnum=$('opt_first');if(fnum)fnum.addEventListener('input',()=>updatePosSentence('position'))}
  wrapAdvanced(); updateActionLabel(); refreshToolInfo();
  resetTool(false); window.scrollTo({top:0,behavior:'smooth'});}
function resetTool(clear=true){if(clear)files=[];renderFileList();clearVisual();$('resultBox').innerHTML='';$('status').textContent='';setProg(0);$('progWrap').classList.add('hidden');refreshToolInfo();if(clear)$('fileInput').value=''}
function opt(k){const el=$('opt_'+k);if(!el)return '';return el.type==='checkbox'?el.checked:el.value}
const dz=$('dropZone');['dragover','dragenter'].forEach(e=>dz.addEventListener(e,ev=>{ev.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(e=>dz.addEventListener(e,ev=>{ev.preventDefault();dz.classList.remove('drag')}));
dz.addEventListener('drop',e=>addFiles([...e.dataTransfer.files]));
/* The whole dropzone is the button (audit fix #8): tapping anywhere in the
   dashed box opens the picker — the label inside already triggers it, so
   skip clicks that land on the label to avoid a double-open. */
dz.addEventListener('click',e=>{if(e.target.closest('label')||e.target===$('fileInput'))return;$('fileInput').click()});
dz.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('fileInput').click()}});
$('fileInput').addEventListener('change',e=>{addFiles([...e.target.files]);e.target.value=''});
function addFiles(list){if(!list||!list.length)return;const big=list.find(f=>f.size>100*1048576);if(big)toast('“'+big.name+'” is very large ('+fmt(big.size)+') — processing may be slow or run out of memory on this device.');files=current&&current.multiple?files.concat(list):list.slice(0,1);renderFileList();onFilesChanged()}
/* ---------- File cards: real first-page thumbnail + page count (benchmark A) ---------- */
const probeCache=new WeakMap();
function probePdf(f){if(probeCache.has(f))return probeCache.get(f);const p=(async()=>{try{const raw=await bytes(f);const pdf=await pdfjsLib.getDocument({data:raw.slice()}).promise;let thumb='';try{const pg=await pdf.getPage(1);const base=pg.getViewport({scale:1});const vp=pg.getViewport({scale:88/base.width});const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;thumb=c.toDataURL('image/jpeg',.7)}catch(e){}return{pages:pdf.numPages,thumb}}catch(e){return{pages:0,thumb:''}}})();probeCache.set(f,p);return p}
function renderFileList(){const el=$('fileList');if(!el)return;if(!files.length){el.innerHTML='';return}const multi=current&&current.multiple;
  el.innerHTML=files.map((f,i)=>{const isImg=/\.(jpe?g|png)$/i.test(f.name)||/^image\//.test(f.type);const isPdf=/\.pdf$/i.test(f.name);
    return `<div class="fileitem" data-idx="${i}">${isPdf?`<img class="fthumb" data-thumb alt="">`:isImg?`<img class="fthumb" data-thumb src="${URL.createObjectURL(f)}" alt="">`:`<span class="fthumb-ic">${icon(current?current.icon:'file-text',24)}</span>`}<span class="fname">${i+1}. ${esc(f.name)}<span class="fmeta" data-meta>${fmt(f.size)}</span></span><span class="fbtns">${multi&&files.length>1?`<button type="button" class="chipbtn" title="Move up" onclick="moveFile(${i},-1)">${icon('arrow-up',15)}</button><button type="button" class="chipbtn" title="Move down" onclick="moveFile(${i},1)">${icon('arrow-down',15)}</button>`:''}<button type="button" class="chipbtn rm" title="Remove file" onclick="removeFile(${i})">${icon('x',15)}</button></span></div>`}).join('')
  +`<div class="filebar"><span id="fileCount">${files.length} file${files.length>1?'s':''} ready</span>${multi?`<label class="btn secondary addmore" for="fileInput">${icon('plus',15)} Add more files</label>`:''}</div>`;
  files.forEach((f,i)=>{if(!/\.pdf$/i.test(f.name))return;probePdf(f).then(info=>{if(files[i]!==f)return;const item=el.querySelector(`.fileitem[data-idx="${i}"]`);if(!item)return;const img=item.querySelector('[data-thumb]');if(img&&info.thumb)img.src=info.thumb;const meta=item.querySelector('[data-meta]');if(meta&&info.pages)meta.textContent=fmt(f.size)+' · '+info.pages+' page'+(info.pages>1?'s':'');refreshToolInfo()})});
  updateActionLabel()}
function removeFile(i){files.splice(i,1);renderFileList();onFilesChanged()}
function moveFile(i,d){const j=i+d;if(j<0||j>=files.length)return;const t=files[i];files[i]=files[j];files[j]=t;renderFileList();onFilesChanged()}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.innerHTML=icon('download',18)+' Download '+name;a.className='btn dlbtn';const b=document.createElement('div');b.appendChild(a);const s=document.createElement('span');s.className='dlmeta';s.textContent=fmt(blob.size);b.appendChild(s);$('resultBox').appendChild(b);return a}
/* Result panel (benchmark C): tool-specific success line, sizes, a
   "Continue to" row of related tools, and the privacy line. The download
   anchor stays the FIRST <a> in #resultBox. */
const SUCCESS_LINES={'merge':()=>'PDFs merged!','split':()=>'PDF split!','remove-pages':m=>m,'extract-pages':()=>'Pages extracted!','organize':()=>'Pages reorganised!','rotate':()=>'Pages rotated!','crop':()=>'PDF cropped!','compress':()=>'PDF compressed!','repair':()=>'PDF repaired!','ocr':()=>'Text recognised!','images-to-pdf':()=>'Your PDF is ready!','html-to-pdf':()=>'Your PDF is ready!','word-to-pdf':()=>'Your PDF is ready!','text-to-pdf':()=>'Your PDF is ready!','pdf-to-jpg':()=>'Images created!','pdf-to-png':()=>'Images created!','pdf-to-text':()=>'Text extracted!','pdf-to-word':()=>'Word file created!','pdf-to-excel':()=>'Spreadsheet created!','pdf-to-markdown':()=>'Markdown created!','edit-pdf':()=>'Text added!','annotate':()=>'Note added!','page-numbers':()=>'Page numbers added!','watermark':()=>'Watermark added!','sign-pdf':()=>'Document signed!','redact':()=>'Redaction complete — the hidden text is gone for good.','protect':()=>'PDF protected!','unlock':()=>'PDF unlocked!','metadata':()=>'Metadata saved!','compare':()=>'Comparison ready!','summarize':()=>'Summary ready!'};
function done(msg,extraHtml){setProg(1,'Done');$('status').textContent=msg;toast(msg);
  const rb=$('resultBox');const head=document.createElement('div');head.className='result-head';head.innerHTML=icon('circle-check',22)+' '+esc((SUCCESS_LINES[current.id]||(()=> 'Done!'))(msg));rb.insertBefore(head,rb.firstChild);
  if(extraHtml){const x=document.createElement('div');x.className='result-extra';x.innerHTML=extraHtml;rb.appendChild(x)}
  const rel=TOOLS.filter(t=>t.cat===current.cat&&t.id!==current.id).slice(0,4);
  const cont=document.createElement('div');cont.className='continue';cont.innerHTML='<span class="cont-label">Continue to</span>'+rel.map(t=>`<button type="button" class="cont-chip" onclick="openTool('${t.id}')">${icon(t.icon,15)} ${t.name}</button>`).join('')+`<button type="button" class="cont-chip" onclick="resetTool()">${icon('rotate-ccw',15)} New task</button>`;rb.appendChild(cont);
  const pv=document.createElement('p');pv.className='privacy-note';pv.innerHTML=icon('lock',13)+' Processed 100% locally — your file never left this device.';rb.appendChild(pv)}
function infoDone(msg){setProg(0);$('progWrap').classList.add('hidden');$('status').textContent=msg;toast(msg)}
async function bytes(f){return new Uint8Array(await f.arrayBuffer())}
function parseRanges(str,total){const out=new Set(); if(!str||!str.trim())return null; str.split(',').map(s=>s.trim()).filter(Boolean).forEach(p=>{if(p.includes('-')){let[a,b]=p.split('-').map(x=>parseInt(x)); if(isNaN(a))a=1; if(isNaN(b)||p.trim().endsWith('-'))b=total; for(let i=Math.max(1,a);i<=Math.min(total,b);i++)out.add(i-1)}else{const n=parseInt(p);if(n>=1&&n<=total)out.add(n-1)}});return [...out].sort((a,b)=>a-b)}
function wrapText(text,font,size,maxW){const words=text.split(/\s+/);const lines=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(font.widthOfTextAtSize(t,size)>maxW&&line){lines.push(line);line=w}else line=t}if(line)lines.push(line);return lines}
async function textToPdfDoc(text,title='Document'){const doc=await PDFDocument.create();const font=await doc.embedFont(StandardFonts.Helvetica);let page=doc.addPage([595,842]);let y=800;const addPage=()=>{page=doc.addPage([595,842]);y=800}; text.split(/\n/).forEach(raw=>{const lines=raw===''?['']:wrapText(raw,font,11,495);lines.forEach(l=>{if(y<50)addPage();page.drawText(l,{x:50,y,size:11,font,color:rgb(.1,.1,.1)});y-=16})});doc.setTitle(title);return doc}
async function extractText(pdfBytes,onProg){const pdf=await pdfjsLib.getDocument({data:pdfBytes.slice()}).promise;let pages=[];for(let i=1;i<=pdf.numPages;i++){const pg=await pdf.getPage(i);const tc=await pg.getTextContent();let lastY=null,lastEndX=null,line='',lines=[];tc.items.forEach(it=>{const y=it.transform[5];if(lastY!==null&&Math.abs(y-lastY)>2){lines.push(line);line='';lastEndX=null}
    /* Preserve wide horizontal gaps as multi-space breaks so PDF to Excel can
       split columns on them (audit fix #7); normal word gaps stay one space. */
    if(lastEndX!==null){const fontH=Math.hypot(it.transform[1],it.transform[3])||10;const gap=it.transform[4]-lastEndX;if(gap>fontH*.8)line+='   '}
    line+=it.str+' ';lastY=y;lastEndX=it.transform[4]+(it.width||0)});if(line)lines.push(line);pages.push(lines.join('\n'));if(onProg)onProg(i,pdf.numPages)}return pages}
async function renderPages(pdfBytes,scale=2,type='image/jpeg',quality=.85,onProg){const pdf=await pdfjsLib.getDocument({data:pdfBytes.slice()}).promise;const out=[];for(let i=1;i<=pdf.numPages;i++){if(jobCancelled)throw cancelError();const pg=await pdf.getPage(i);const vp=pg.getViewport({scale});const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;out.push(await new Promise(r=>c.toBlob(r,type,quality)));if(onProg)onProg(i,pdf.numPages)}return out}
function baseName(f){return f.name.replace(/\.[^.]+$/,'')}

/* ================= Signature: draw / type / upload, transparent art =================
   The stamped image is sigArt — an offscreen canvas cropped to the ink, with a
   TRANSPARENT background (the pad is never filled), so no white box can land
   on the document. Draw, Type and Upload all produce sigArt. */
let sigCtx, sigArt=null, sigDrawn=false, sigPenColor='#111111', sigTypeFont="'Segoe Script','Brush Script MT',cursive", sigTypeColor='#111111', sigWired=false;
function cropToInk(src,padPx=8){try{const w=src.width,h=src.height;if(!w||!h)return null;const g=src.getContext('2d');const d=g.getImageData(0,0,w,h).data;let minX=w,minY=h,maxX=-1,maxY=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(d[(y*w+x)*4+3]>10){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y}}if(maxX<0)return null;minX=Math.max(0,minX-padPx);minY=Math.max(0,minY-padPx);maxX=Math.min(w-1,maxX+padPx);maxY=Math.min(h-1,maxY+padPx);const out=document.createElement('canvas');out.width=maxX-minX+1;out.height=maxY-minY+1;out.getContext('2d').drawImage(src,minX,minY,out.width,out.height,0,0,out.width,out.height);return out}catch(e){return src}}
function setSigArt(canvas){sigArt=canvas;sigDrawn=!!canvas;if(ed&&ed.kind==='sign-pdf')drawEdOverlay();updateActionLabel()}
function refreshSigArtFromPad(){const c=$('sigpad');if(!c)return;setSigArt(cropToInk(c))}
function initSig(){const c=$('sigpad');if(!c)return;sigCtx=c.getContext('2d');sigCtx.lineWidth=3;sigCtx.lineCap='round';sigCtx.lineJoin='round';sigCtx.strokeStyle=sigPenColor;let down=false,last;
  const pos=e=>{const r=c.getBoundingClientRect();const p=e.touches?e.touches[0]:e;return{x:(p.clientX-r.left)*(c.width/r.width),y:(p.clientY-r.top)*(c.height/r.height)}};
  const strokeMove=e=>{if(!down)return;const p=pos(e);sigCtx.beginPath();sigCtx.moveTo(last.x,last.y);sigCtx.lineTo(p.x,p.y);sigCtx.stroke();last=p;if(e.cancelable)e.preventDefault()};
  const strokeEnd=()=>{if(!down)return;down=false;window.removeEventListener('mousemove',strokeMove);window.removeEventListener('mouseup',strokeEnd);window.removeEventListener('touchmove',strokeMove);window.removeEventListener('touchend',strokeEnd);refreshSigArtFromPad()};
  // Move/up are tracked on the WINDOW during a stroke: if the layout shifts
  // mid-draw (a heavy preview finishing rendering above the pad), the stroke
  // still completes instead of silently losing its end.
  c.onmousedown=c.ontouchstart=e=>{down=true;last=pos(e);e.preventDefault();window.addEventListener('mousemove',strokeMove);window.addEventListener('mouseup',strokeEnd);window.addEventListener('touchmove',strokeMove,{passive:false});window.addEventListener('touchend',strokeEnd)};
  if(sigWired)return;sigWired=true;
  document.querySelectorAll('.sigtab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.sigtab').forEach(x=>{const on=x===b;x.classList.toggle('sel',on);x.setAttribute('aria-pressed',on?'true':'false')});$('sigDrawPane').classList.toggle('hidden',b.dataset.sigtab!=='draw');$('sigTypePane').classList.toggle('hidden',b.dataset.sigtab!=='type');$('sigUploadPane').classList.toggle('hidden',b.dataset.sigtab!=='upload')}));
  document.querySelectorAll('[data-sigcolor]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-sigcolor]').forEach(x=>x.classList.toggle('sel',x===b));sigPenColor=b.dataset.sigcolor;if(sigCtx)sigCtx.strokeStyle=sigPenColor}));
  document.querySelectorAll('[data-sigfont]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-sigfont]').forEach(x=>x.classList.toggle('sel',x===b));sigTypeFont=b.dataset.sigfont;syncSigTypePrev()}));
  document.querySelectorAll('[data-sigtype-color]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-sigtype-color]').forEach(x=>x.classList.toggle('sel',x===b));sigTypeColor=b.dataset.sigtypeColor;syncSigTypePrev()}));
  const nm=$('sigName');if(nm)nm.addEventListener('input',syncSigTypePrev);
  const use=$('sigTypeUse');if(use)use.addEventListener('click',()=>{const name=(nm?nm.value:'').trim();if(!name){toast('Type your name first.');return}const t=document.createElement('canvas');const g=t.getContext('2d');const size=110;g.font=size+'px '+sigTypeFont;const w=Math.max(10,Math.ceil(g.measureText(name).width));t.width=w+24;t.height=size*1.5;const g2=t.getContext('2d');g2.font=size+'px '+sigTypeFont;g2.fillStyle=sigTypeColor;g2.textBaseline='middle';g2.fillText(name,12,t.height/2);setSigArt(cropToInk(t,6)||t);toast('Signature ready — drag it into place on the preview above.')});
  const sf=$('sigFile');if(sf)sf.addEventListener('change',()=>{const f=sf.files&&sf.files[0];if(!f)return;const img=new Image();img.onload=()=>{const t=document.createElement('canvas');const maxW=900;const sc=Math.min(1,maxW/img.width);t.width=Math.round(img.width*sc);t.height=Math.round(img.height*sc);t.getContext('2d').drawImage(img,0,0,t.width,t.height);setSigArt(cropToInk(t,6)||t);URL.revokeObjectURL(img.src);toast('Signature image ready — drag it into place on the preview above.')};img.src=URL.createObjectURL(f);sf.value=''});
}
function syncSigTypePrev(){const p=$('sigTypePrev');if(!p)return;const name=($('sigName')&&$('sigName').value.trim())||'Your name';p.textContent=name;p.style.fontFamily=sigTypeFont;p.style.color=sigTypeColor}
function clearSig(){const c=$('sigpad');sigCtx&&sigCtx.clearRect(0,0,c.width,c.height);setSigArt(null)}

/* ================= Visual page manager + placement editors =================
   All overlay positions are stored as fractions of the page (0..1), so preview
   size / device width never matter. PDF y-axis is flipped at stamp time:
   pdfY = pageH - (fy + fh) * pageH. Placement assumes page rotation 0 —
   pages with existing rotation are an edge limit (noted in TEST-REPORT). */
const VISUAL_PM={'remove-pages':'remove','extract-pages':'extract','organize':'organize','rotate':'rotate'};
const EDITOR_TOOLS=['crop','sign-pdf','edit-pdf','annotate','redact'];
let pm=null, ed=null, visualSeq=0;
/* clearVisual is the chokepoint where pm/ed state dies — Reset and
   last-file removal both pass through here, and renderFileList's empty
   branch never refreshes the label. Recompute the action label from the
   cleared state, or state-dependent labels (Redact's "Cover N area(s)",
   Merge's "Merge N PDFs", selection counts…) keep their stale text. */
function clearVisual(){visualSeq++;pm=null;ed=null;const w=$('visualWrap');if(w){w.innerHTML='';w.classList.add('hidden')}updateActionLabel()}
function onFilesChanged(){if(!current)return;const needs=VISUAL_PM[current.id]||current.id==='split'||EDITOR_TOOLS.includes(current.id);if(needs&&files.length&&/\.pdf$/i.test(files[0].name))buildVisual();else if(!files.length)clearVisual();
  if(current.id==='metadata'&&files.length)loadMetadataView();refreshToolInfo()}
async function loadMetadataView(){const view=$('metaView');if(!view||!files.length)return;metaLoaded=false;try{const doc=await PDFDocument.load(await bytes(files[0]));const cur={title:doc.getTitle()||'',author:doc.getAuthor()||'',subject:doc.getSubject()||'',keywords:doc.getKeywords()||''};metaLoaded=true;
  view.innerHTML='<strong>Currently stored in this PDF:</strong><br>Title: '+(esc(cur.title)||'<em>— empty —</em>')+'<br>Author: '+(esc(cur.author)||'<em>— empty —</em>')+'<br>Subject: '+(esc(cur.subject)||'<em>— empty —</em>')+'<br>Keywords: '+(esc(cur.keywords)||'<em>— empty —</em>')+'<br><span style="color:var(--muted)">The fields below are filled in with these values — edit them, blank a field to clear it, then save.</span>';
  const set=(k,v)=>{const el=$('opt_'+k);if(el)el.value=v};set('title',cur.title);set('author',cur.author);set('subject',cur.subject);set('keywords',cur.keywords)}catch(e){view.textContent='Could not read this PDF\'s metadata — it may be damaged or password-protected.'}}
function refreshToolInfo(){const el=$('toolInfo');if(!el||!current)return;let txt='';
  // Page count arrives asynchronously via the file-card probe; read it back
  // from the card's meta line ("1.0 MB · 14 pages") once it lands.
  const metaEl=document.querySelector('.fileitem [data-meta]');const m=metaEl?/· (\d+) page/.exec(metaEl.textContent):null;const pages=m?parseInt(m[1]):0;
  if(current.id==='pdf-to-jpg'&&pages)txt=pages+' JPG image'+(pages>1?'s':'')+' will be created — one per page'+(pages>1?', delivered as a ZIP file.':'.');
  else if(current.id==='pdf-to-png'&&pages)txt=pages+' PNG image'+(pages>1?'s':'')+' will be created — one per page'+(pages>1?', delivered as a ZIP file.':'.');
  else if(current.id==='split'&&pages){const mode=opt('mode');if(mode==='each')txt=pages+' PDFs will be created — one per page, delivered as a ZIP file.';else if(mode==='pick')txt='Tap pages in the preview — the ones you pick are combined into 1 PDF.'}
  el.textContent=txt;el.classList.toggle('hidden',!txt)}
/* ---------- Plain labels, collapsed advanced, friendly errors ---------- */
const HIDE_OPTS={'remove-pages':['pages'],'extract-pages':['pages'],'organize':['order'],'rotate':['angle','pages'],'edit-pdf':['page'],'annotate':['page'],'redact':['page'],'split':['ranges'],'crop':['left','right','top','bottom']};
function wrapAdvanced(){if(!current)return;const hide=HIDE_OPTS[current.id];if(!hide)return;const box=$('toolOpts');if(!box)return;
  const fields=[...box.querySelectorAll('.field')].filter(f=>{const inp=f.querySelector('input,select,textarea');return inp&&hide.includes(inp.id.replace('opt_',''))});
  if(!fields.length)return;const det=document.createElement('details');det.className='adv';det.innerHTML='<summary>Advanced options — type instead of tapping</summary>';
  const grid=document.createElement('div');grid.className='opts';fields.forEach(f=>grid.appendChild(f));det.appendChild(grid);box.appendChild(det)}
function updateActionLabel(){const btn=$('processBtn');if(!btn||!current||busy)return;const n=files.length;const sel=pm?pm.sel.size:0;let label=current.name;
  if(current.id==='merge')label=n>1?'Merge '+n+' PDFs':'Merge PDF';
  else if(current.id==='remove-pages')label=sel?'Remove '+sel+' page'+(sel>1?'s':''):'Remove pages';
  else if(current.id==='extract-pages')label=sel?'Extract '+sel+' page'+(sel>1?'s':''):'Extract pages';
  else if(current.id==='split'){const m=opt('mode');label=m==='pick'?(sel?'Extract '+sel+' pages as one PDF':'Extract picked pages'):'Split PDF'}
  else if(current.id==='organize')label='Save new order';
  else if(current.id==='rotate')label=(pm&&Object.values(pm.rot).some(a=>a))?'Save rotated PDF':'Rotate all pages';
  else if(current.id==='sign-pdf')label='Place signature & download';
  else if(current.id==='edit-pdf')label='Add text & download';
  else if(current.id==='annotate')label='Add note & download';
  else if(current.id==='redact')label=ed&&ed.boxes.length?'Cover '+ed.boxes.length+' area'+(ed.boxes.length>1?'s':'')+' & download':'Cover areas & download';
  else if(current.id==='images-to-pdf')label=n>1?'Make PDF from '+n+' images':'Make PDF';
  else if(current.id==='compare')label='Compare the 2 PDFs';
  btn.textContent=label;btn.classList.toggle('pulse',n>0)}
async function buildVisual(){
  const seq=++visualSeq;pm=null;ed=null;const w=$('visualWrap');if(!w)return;const wasHidden=w.classList.contains('hidden');w.classList.remove('hidden');w.innerHTML='<p class="vload">Rendering page previews…</p>';
  let pdf;try{const raw=await bytes(files[0]);pdf=await pdfjsLib.getDocument({data:raw.slice()}).promise}catch(e){if(seq===visualSeq)w.innerHTML='<p class="vload">Could not render previews for this file. The options below still work.</p>';return}
  if(seq!==visualSeq||!current)return;
  if(VISUAL_PM[current.id])buildPageManager(pdf,VISUAL_PM[current.id]);
  else if(current.id==='split'){buildPageManager(pdf,'pick');const m=$('opt_mode');if(m)m.addEventListener('change',updateActionLabel)}
  else buildEditor(pdf,current.id);
  updateActionLabel();
  if(wasHidden)setTimeout(()=>{const vw=$('visualWrap');if(vw&&visualSeq===seq)vw.scrollIntoView({behavior:'smooth',block:'start'})},80);
}
/* ---------- Page Manager (Remove / Extract / Organize / Rotate / Split-pick) ---------- */
function buildPageManager(pdf,mode){
  pm={mode,pdf,count:pdf.numPages,sel:new Set(),order:[...Array(pdf.numPages).keys()],rot:{},deleted:new Set(),blanks:0,rendered:new Set(),thumbEls:{}};
  const hints={remove:'Tap pages to mark them for removal.',extract:'Tap pages to extract.',organize:'Drag thumbnails — or use '+icon('chevron-left',13)+' '+icon('chevron-right',13)+' — to reorder. Tap '+icon('trash-2',13)+' to take a page out, or add a blank page.',rotate:'Tap '+icon('rotate-cw',13)+' on a page to rotate just that page 90°.',pick:'If “How to split” is set to “Pick pages”, tap the pages to pull out together as one PDF.'};
  $('visualWrap').innerHTML=`<div class="pm"><div class="pm-toolbar"><strong>Pages (${pm.count})</strong><span class="pm-hint">${hints[mode]||''}</span>${(mode==='remove'||mode==='extract'||mode==='pick')?'<button type="button" class="chipbtn wide" onclick="pmSelectAll()">Select all</button><button type="button" class="chipbtn wide" onclick="pmClearSel()">Clear</button>':''}${mode==='organize'?'<button type="button" class="chipbtn wide" onclick="pmAddBlank()">+ Add blank page</button>':''}<span id="pmSelInfo" class="pm-info"></span></div><div class="thumbgrid mode-${mode}" id="thumbGrid"></div></div>`;
  const grid=$('thumbGrid');
  for(let i=0;i<pm.count;i++)grid.appendChild(makeThumb(i));
  pmSync();pmInfo();
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{es.forEach(en=>{if(en.isIntersecting){renderThumb(parseInt(en.target.dataset.idx));io.unobserve(en.target)}})},{rootMargin:'240px'});Object.values(pm.thumbEls).forEach(d=>{if(d.dataset.idx>=0)io.observe(d)})}else for(let i=0;i<pm.count;i++)renderThumb(i);
}
function makeThumb(i){const mode=pm.mode;const d=document.createElement('div');d.className='thumb';d.dataset.idx=i;
  d.innerHTML=`<div class="thumb-wrap"><canvas></canvas>${mode==='remove'?'<div class="thumb-x">'+icon('x',46)+'</div>':''}${(mode==='extract'||mode==='pick')?'<div class="thumb-check">'+icon('check',38)+'</div>':''}${mode==='rotate'?'<button type="button" class="rotbtn" title="Rotate this page 90°">'+icon('rotate-cw',18)+'</button>':''}${mode==='organize'?'<button type="button" class="thumb-del" title="Remove this page from the new document">'+icon('trash-2',15)+'</button><div class="thumb-move"><button type="button" class="chipbtn" data-mv="-1" title="Move earlier">'+icon('chevron-left',15)+'</button><button type="button" class="chipbtn" data-mv="1" title="Move later">'+icon('chevron-right',15)+'</button></div>':''}</div><div class="thumb-label">Page ${i+1}</div>`;
  pm.thumbEls[i]=d;
  if(mode==='remove'||mode==='extract'||mode==='pick'){d.addEventListener('click',()=>{if(pm.sel.has(i))pm.sel.delete(i);else pm.sel.add(i);d.classList.toggle('sel',pm.sel.has(i));pmSync();pmInfo()})}
  if(mode==='rotate'){d.querySelector('.rotbtn').addEventListener('click',ev=>{ev.stopPropagation();pm.rot[i]=((pm.rot[i]||0)+90)%360;d.querySelector('canvas').style.transform='rotate('+pm.rot[i]+'deg)';pmInfo()})}
  if(mode==='organize'){d.querySelectorAll('[data-mv]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();moveThumb(i,parseInt(b.dataset.mv))}));d.querySelector('.thumb-del').addEventListener('click',ev=>{ev.stopPropagation();pmToggleDelete(i)});attachThumbDrag(d)}
  return d}
async function renderThumb(i){if(!pm||i<0||pm.rendered.has(i))return;pm.rendered.add(i);try{const pg=await pm.pdf.getPage(i+1);const base=pg.getViewport({scale:1});const vp=pg.getViewport({scale:150/base.width});const c=pm.thumbEls[i].querySelector('canvas');if(!c)return;c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise}catch(e){}}
function pmToggleDelete(i){if(!pm)return;if(pm.deleted.has(i)){pm.deleted.delete(i);pm.thumbEls[i].classList.remove('deleted')}else{pm.deleted.add(i);pm.thumbEls[i].classList.add('deleted')}pmSync();pmInfo()}
function pmAddBlank(){if(!pm)return;pm.blanks++;const id=-pm.blanks;const d=document.createElement('div');d.className='thumb';d.dataset.idx=id;
  d.innerHTML=`<div class="thumb-wrap"><div class="thumb-blank">${icon('file',32)}</div><button type="button" class="thumb-del" title="Remove this blank page">${icon('trash-2',15)}</button><div class="thumb-move"><button type="button" class="chipbtn" data-mv="-1" title="Move earlier">${icon('chevron-left',15)}</button><button type="button" class="chipbtn" data-mv="1" title="Move later">${icon('chevron-right',15)}</button></div></div><div class="thumb-label">Blank page</div>`;
  pm.thumbEls[id]=d;pm.order.push(id);$('thumbGrid').appendChild(d);
  d.querySelectorAll('[data-mv]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();moveThumb(id,parseInt(b.dataset.mv))}));
  d.querySelector('.thumb-del').addEventListener('click',ev=>{ev.stopPropagation();pm.order=pm.order.filter(x=>x!==id);delete pm.thumbEls[id];d.remove();pmSync();pmInfo()});
  attachThumbDrag(d);pmSync();pmInfo()}
function pmSync(){if(!pm)return;const sorted=[...pm.sel].sort((a,b)=>a-b).map(i=>i+1).join(',');
  if(pm.mode==='remove'||pm.mode==='extract'){const el=$('opt_pages');if(el)el.value=sorted}
  if(pm.mode==='organize'){const el=$('opt_order');if(el)el.value=pm.order.filter(i=>i>=0&&!pm.deleted.has(i)).map(i=>i+1).join(',')}}
function pmInfo(){if(!pm)return;const el=$('pmSelInfo');if(!el)return;let t='';
  if(pm.mode==='remove')t=pm.sel.size?pm.sel.size+' marked for removal':'None marked';
  else if(pm.mode==='extract'||pm.mode==='pick')t=pm.sel.size?pm.sel.size+' selected':'None selected';
  else if(pm.mode==='rotate'){const n=Object.values(pm.rot).filter(a=>a).length;t=n?n+' page(s) rotated':''}
  else if(pm.mode==='organize'){const kept=pm.order.filter(i=>i<0||!pm.deleted.has(i));t='New document: '+kept.length+' page'+(kept.length===1?'':'s')+(pm.deleted.size?' · '+pm.deleted.size+' removed':'')}
  el.textContent=t;updateActionLabel()}
function pmSelectAll(){if(!pm)return;for(let i=0;i<pm.count;i++){pm.sel.add(i);pm.thumbEls[i].classList.add('sel')}pmSync();pmInfo()}
function pmClearSel(){if(!pm)return;pm.sel.clear();Object.values(pm.thumbEls).forEach(d=>d.classList.remove('sel'));pmSync();pmInfo()}
function moveThumb(pageIdx,dir){if(!pm)return;const pos=pm.order.indexOf(pageIdx);const j=pos+dir;if(j<0||j>=pm.order.length)return;const t=pm.order[pos];pm.order[pos]=pm.order[j];pm.order[j]=t;const grid=$('thumbGrid');pm.order.forEach(pi=>grid.appendChild(pm.thumbEls[pi]));pmSync();pmInfo()}
function attachThumbDrag(d){
  d.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const startX=e.clientX,startY=e.clientY;let dragging=false;
    const move=ev=>{const dx=ev.clientX-startX,dy=ev.clientY-startY;
      if(!dragging&&Math.hypot(dx,dy)>9){dragging=true;d.classList.add('dragging');try{d.setPointerCapture(e.pointerId)}catch(_){}}
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
  $('visualWrap').innerHTML=`<div class="pm"><div class="pm-toolbar"><strong>${titles[kind]||''}</strong><span class="pm-nav"><button type="button" class="chipbtn wide" onclick="edNav(-1)">${icon('chevron-left',15)} Prev</button><span id="edPageInfo" class="pm-info"></span><button type="button" class="chipbtn wide" onclick="edNav(1)">Next ${icon('chevron-right',15)}</button></span></div><div class="stage" id="edStage"><canvas id="edCanvas"></canvas><div id="edOverlay"></div></div><div id="edExtra"></div></div>`;
  if(kind==='sign-pdf'){$('edExtra').innerHTML=`<div class="field" style="margin-top:12px;max-width:340px"><label>Signature size</label><input type="range" id="signSize" min="12" max="85" value="38"></div><p class="pm-hint">Create your signature with Draw, Type or Upload (below the preview) — it appears here and can be dragged to any position, on any page. Placement assumes unrotated pages.</p>`;$('signSize').addEventListener('input',e=>{ed.signW=e.target.value/100;drawEdOverlay()})}
  if(kind==='redact'){$('edExtra').innerHTML='<div id="boxList" style="margin-top:10px"></div>';renderBoxList()}
  if(kind==='crop'){$('edExtra').innerHTML='<p class="pm-hint">The same trim is applied to every page. Fine-tune the trim numbers under “Advanced options” below.</p>'}
  if(kind==='edit-pdf'||kind==='annotate'){$('edExtra').innerHTML='<p class="pm-hint">Page selector above and the “Page number” field under Advanced options stay in sync.</p>'}
  renderEdPage();attachStageHandlers();
}
function edNav(d){if(!ed)return;ed.page=Math.min(ed.count-1,Math.max(0,ed.page+d));renderEdPage()}
async function renderEdPage(){
  if(!ed)return;const info=$('edPageInfo');if(info)info.textContent='Page '+(ed.page+1)+' of '+ed.count;
  const pageField=$('opt_page');if(pageField&&(ed.kind==='edit-pdf'||ed.kind==='annotate'||ed.kind==='redact'))pageField.value=ed.page+1;
  try{const pg=await ed.pdf.getPage(ed.page+1);const base=pg.getViewport({scale:1});ed.pageW=base.width;ed.pageH=base.height;
    const wrap=$('visualWrap');const targetW=Math.min(960,Math.max(280,(wrap?wrap.clientWidth:960)-16));const vp=pg.getViewport({scale:targetW/base.width});
    const c=$('edCanvas');if(!c)return;c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise}catch(e){}
  drawEdOverlay();if(ed&&ed.kind==='crop')syncCropOpts();
}
function fracFromEvent(e){const r=$('edOverlay').getBoundingClientRect();return{fx:Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),fy:Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))}}
function drawEdOverlay(){
  if(!ed||ed._dragging)return;const ov=$('edOverlay');if(!ov)return;ov.innerHTML='';
  if(ed.kind==='sign-pdf'){if(!sigDrawn||!sigArt)return;const b=document.createElement('div');b.className='sigbox';b.id='sigBox';b.style.left=(ed.signPos.fx*100)+'%';b.style.top=(ed.signPos.fy*100)+'%';b.style.width=(ed.signW*100)+'%';const img=document.createElement('img');img.src=sigArt.toDataURL('image/png');img.alt='Your signature';b.appendChild(img);ov.appendChild(b);
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const start=fracFromEvent(e);const off={dx:start.fx-ed.signPos.fx,dy:start.fy-ed.signPos.fy};b.setPointerCapture(e.pointerId);
      const move=ev=>{const p=fracFromEvent(ev);ed.signPos.fx=Math.min(1-ed.signW,Math.max(0,p.fx-off.dx));ed.signPos.fy=Math.min(.98,Math.max(0,p.fy-off.dy));b.style.left=(ed.signPos.fx*100)+'%';b.style.top=(ed.signPos.fy*100)+'%'};
      const up=()=>{b.removeEventListener('pointermove',move);b.removeEventListener('pointerup',up)};b.addEventListener('pointermove',move);b.addEventListener('pointerup',up)});return}
  if(ed.kind==='edit-pdf'){if(ed.marker&&ed.marker.page===ed.page){const m=document.createElement('div');m.className='marker';m.style.left=(ed.marker.fx*100)+'%';m.style.top=(ed.marker.fy*100)+'%';m.textContent=($('opt_text')?$('opt_text').value:'')||'Text';ov.appendChild(m)}return}
  if(ed.kind==='annotate'){if(ed.rect&&ed.rect.page===ed.page)ov.appendChild(rectDiv(ed.rect,'notebox',''));return}
  if(ed.kind==='redact'){ed.boxes.forEach((bx,i)=>{if(bx.page!==ed.page)return;const d=rectDiv(bx,'rbox','');const x=document.createElement('button');x.type='button';x.className='rbox-x';x.innerHTML=icon('x',12);x.title='Remove this box';x.addEventListener('pointerdown',ev=>ev.stopPropagation());x.addEventListener('click',ev=>{ev.stopPropagation();ed.boxes.splice(i,1);drawEdOverlay();renderBoxList()});d.appendChild(x);ov.appendChild(d)});return}
  if(ed.kind==='crop'){const r=ed.crop;const d=document.createElement('div');d.className='crop-rect';d.style.left=(r.fx*100)+'%';d.style.top=(r.fy*100)+'%';d.style.width=(r.fw*100)+'%';d.style.height=(r.fh*100)+'%';const h=document.createElement('div');h.className='crop-handle';h.title='Drag to resize';d.appendChild(h);ov.appendChild(d);
    d.addEventListener('pointerdown',e=>{if(e.target===h)return;e.preventDefault();const start=fracFromEvent(e);const orig={...ed.crop};d.setPointerCapture(e.pointerId);
      const move=ev=>{const p=fracFromEvent(ev);ed.crop.fx=Math.min(1-ed.crop.fw,Math.max(0,orig.fx+(p.fx-start.fx)));ed.crop.fy=Math.min(1-ed.crop.fh,Math.max(0,orig.fy+(p.fy-start.fy)));d.style.left=(ed.crop.fx*100)+'%';d.style.top=(ed.crop.fy*100)+'%';syncCropOpts()};
      const up=()=>{d.removeEventListener('pointermove',move);d.removeEventListener('pointerup',up)};d.addEventListener('pointermove',move);d.addEventListener('pointerup',up)});
    h.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const start=fracFromEvent(e);const orig={...ed.crop};h.setPointerCapture(e.pointerId);
      const move=ev=>{const p=fracFromEvent(ev);ed.crop.fw=Math.min(1-ed.crop.fx,Math.max(.08,orig.fw+(p.fx-start.fx)));ed.crop.fh=Math.min(1-ed.crop.fy,Math.max(.08,orig.fh+(p.fy-start.fy)));d.style.width=(ed.crop.fw*100)+'%';d.style.height=(ed.crop.fh*100)+'%';syncCropOpts()};
      const up=()=>{h.removeEventListener('pointermove',move);h.removeEventListener('pointerup',up)};h.addEventListener('pointermove',move);h.addEventListener('pointerup',up)});return}
}
function rectDiv(r,cls){const d=document.createElement('div');d.className=cls;d.style.left=(r.fx*100)+'%';d.style.top=(r.fy*100)+'%';d.style.width=(r.fw*100)+'%';d.style.height=(r.fh*100)+'%';return d}
function renderBoxList(){const el=$('boxList');if(!el||!ed)return;el.innerHTML=ed.boxes.length?('<strong>'+ed.boxes.length+' box(es):</strong> '+ed.boxes.map((b,i)=>`<span class="boxitem">Page ${b.page+1} <button type="button" class="chipbtn rm" onclick="removeBox(${i})">${icon('x',13)}</button></span>`).join(' ')):'<span class="pm-hint">No boxes yet — drag on the page to add one. Nothing is redacted until you draw at least one box.</span>';updateActionLabel()}
function removeBox(i){if(!ed)return;ed.boxes.splice(i,1);drawEdOverlay();renderBoxList()}
function syncCropOpts(){if(!ed||!ed.pageW)return;const r=ed.crop;const set=(k,v)=>{const el=$('opt_'+k);if(el)el.value=Math.max(0,Math.round(v))};set('left',r.fx*ed.pageW);set('right',(1-r.fx-r.fw)*ed.pageW);set('top',r.fy*ed.pageH);set('bottom',(1-r.fy-r.fh)*ed.pageH)}
function attachStageHandlers(){
  const ov=$('edOverlay');if(!ov||!ed)return;
  if(ed.kind==='edit-pdf'){const txt=$('opt_text');if(txt)txt.addEventListener('input',()=>drawEdOverlay());
    ov.addEventListener('pointerdown',e=>{const p=fracFromEvent(e);ed.marker={fx:p.fx,fy:p.fy,page:ed.page};drawEdOverlay()});return}
  if(ed.kind==='annotate'||ed.kind==='redact'){
    ov.addEventListener('pointerdown',e=>{if(e.target.closest('.rbox-x'))return;const start=fracFromEvent(e);ed._dragging=true;try{ov.setPointerCapture(e.pointerId)}catch(_){}const ghost=rectDiv({fx:start.fx,fy:start.fy,fw:0,fh:0},ed.kind==='redact'?'rbox':'notebox');ov.appendChild(ghost);
      const move=ev=>{const p=fracFromEvent(ev);const r={fx:Math.min(start.fx,p.fx),fy:Math.min(start.fy,p.fy),fw:Math.abs(p.fx-start.fx),fh:Math.abs(p.fy-start.fy)};ghost.style.left=(r.fx*100)+'%';ghost.style.top=(r.fy*100)+'%';ghost.style.width=(r.fw*100)+'%';ghost.style.height=(r.fh*100)+'%';ghost.dataset.rect=JSON.stringify(r)};
      const up=()=>{ov.removeEventListener('pointermove',move);ov.removeEventListener('pointerup',up);ov.removeEventListener('pointercancel',up);ed._dragging=false;const r=ghost.dataset.rect?JSON.parse(ghost.dataset.rect):null;ghost.remove();if(r&&r.fw>.01&&r.fh>.01){r.page=ed.page;if(ed.kind==='redact'){ed.boxes.push(r);renderBoxList()}else ed.rect=r}drawEdOverlay()};
      ov.addEventListener('pointermove',move);ov.addEventListener('pointerup',up);ov.addEventListener('pointercancel',up)});return}
}

/* ================= Processing ================= */
const ocrState={page:1};
let metaLoaded=false;
$('processBtn').addEventListener('click',async()=>{
  if(!current||busy)return;
  if(!files.length){toast('Please choose a file first.');return}
  startJob();
  try{ await processTool(); }
  catch(err){ if(err&&err.__cancelled){$('status').textContent='Cancelled — nothing was changed.';setProg(0);$('progWrap').classList.add('hidden');toast('Cancelled.')}
    else{const fe=friendlyError(err);setErrorStatus(fe);toast(fe);setProg(0);$('progWrap').classList.add('hidden')} }
  finally{ endJob(); }
});
async function saveDoc(doc,name){download(new Blob([await doc.save()],{type:'application/pdf'}),name)}
async function zipOut(items,name){if(items.length===1){download(items[0].blob,items[0].name)}else{const zip=new JSZip();items.forEach(i=>zip.file(i.name,i.blob));download(await zip.generateAsync({type:'blob'}),name)}}
async function processTool(){
  const id=current.id, f=files[0];
  if(id==='merge'){const out=await PDFDocument.create();for(let fi=0;fi<files.length;fi++){const src=await PDFDocument.load(await bytes(files[fi]));(await out.copyPages(src,src.getPageIndices())).forEach(p=>out.addPage(p));tick(fi+1,files.length,'Merging PDFs')}await saveDoc(out,'aurelia-merged.pdf');return done('Merged '+files.length+' PDFs into one file.')}
  if(id==='text-to-pdf'){const doc=await textToPdfDoc(await f.text(),baseName(f));await saveDoc(doc,baseName(f)+'.pdf');return done('Text converted to PDF.')}
  if(id==='html-to-pdf'){const html=await f.text();const div=document.createElement('div');div.innerHTML=html;const doc=await textToPdfDoc(div.innerText||div.textContent,baseName(f));await saveDoc(doc,baseName(f)+'.pdf');return done('HTML text converted to PDF (Beta — layout simplified).')}
  if(id==='word-to-pdf'){if(!window.mammoth)throw new Error('Word library failed to load — check connection and retry.');const r=await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()});const doc=await textToPdfDoc(r.value,baseName(f));await saveDoc(doc,baseName(f)+'.pdf');return done('Word document converted (text-based Beta — layout simplified).')}
  if(id==='images-to-pdf'){const doc=await PDFDocument.create();const margin=parseFloat(opt('margin'))||0;const sizes={A4:[595,842],Letter:[612,792]};for(let fi=0;fi<files.length;fi++){const file=files[fi];const b=await bytes(file);const img=file.type.includes('png')||/\.png$/i.test(file.name)?await doc.embedPng(b):await doc.embedJpg(b);let pw,ph;if(opt('size')==='Fit image'){pw=img.width+margin*2;ph=img.height+margin*2}else{[pw,ph]=sizes[opt('size')]||sizes.A4}const page=doc.addPage([pw,ph]);const s=Math.min((pw-margin*2)/img.width,(ph-margin*2)/img.height);const w=img.width*s,h=img.height*s;page.drawImage(img,{x:(pw-w)/2,y:(ph-h)/2,width:w,height:h});tick(fi+1,files.length,'Building your PDF')}await saveDoc(doc,'aurelia-images.pdf');return done(files.length+' image(s) converted to one PDF.')}
  // All remaining tools take a PDF first file
  const raw=await bytes(f);
  if(id==='pdf-to-text'){const pages=await extractText(raw,(i,n)=>tick(i,n,'Extracting text'));download(new Blob([pages.join('\n\n--- Page break ---\n\n')],{type:'text/plain'}),baseName(f)+'.txt');return done('Extracted text from '+pages.length+' page(s).')}
  if(id==='pdf-to-markdown'){const pages=await extractText(raw,(i,n)=>tick(i,n,'Reading pages'));download(new Blob([pages.map((p,i)=>'## Page '+(i+1)+'\n\n'+p).join('\n\n')],{type:'text/markdown'}),baseName(f)+'.md');return done('Markdown created (Beta — page-by-page text, structure approximate).')}
  if(id==='summarize'){const pages=await extractText(raw,(i,n)=>tick(i,n,'Reading pages'));const text=pages.join(' ');const words=text.trim()?text.trim().split(/\s+/).length:0;const sents=text.match(/[^.!?]+[.!?]+/g)||[];
    if(words<20||sents.length<2)return infoDone('No readable text found in this PDF — it looks like scanned images rather than text. Try the “OCR PDF” tool first to turn the scans into text, then summarise.');
    const freq={};text.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(/\s+/).forEach(w=>{if(w.length>3)freq[w]=(freq[w]||0)+1});const scored=sents.map((s,i)=>({s,i,score:s.toLowerCase().split(/\s+/).reduce((a,w)=>a+(freq[w.replace(/[^a-z0-9]/g,'')]||0),0)}));const top=scored.sort((a,b)=>b.score-a.score).slice(0,Math.min(7,sents.length)).sort((a,b)=>a.i-b.i).map(x=>x.s.trim());const out='SUMMARY — '+f.name+'\nPages: '+pages.length+' · Words: '+words+'\n\n'+top.map(s=>'• '+s).join('\n');download(new Blob([out],{type:'text/plain'}),baseName(f)+'-summary.txt');$('resultBox').insertAdjacentHTML('beforeend','<div class="glass" style="padding:16px;border-radius:var(--r-md);white-space:pre-wrap">'+esc(out)+'</div>');return done('Summary ready — computed locally, no AI server used.')}
  if(id==='compare'){if(files.length<2)throw new Error('Choose 2 PDFs to compare.');const a=(await extractText(await bytes(files[0]),(i,n)=>tick(i,2*n,'Comparing PDFs'))).join('\n').split('\n'),b=(await extractText(await bytes(files[1]))).join('\n').split('\n');const setB=new Set(b),setA=new Set(a);const onlyA=a.filter(l=>l.trim()&&!setB.has(l)),onlyB=b.filter(l=>l.trim()&&!setA.has(l));const report='COMPARE REPORT\n'+files[0].name+' vs '+files[1].name+'\n\nLines only in FIRST ('+onlyA.length+'):\n'+onlyA.join('\n')+'\n\nLines only in SECOND ('+onlyB.length+'):\n'+onlyB.join('\n');download(new Blob([report],{type:'text/plain'}),'aurelia-compare.txt');return done('Comparison ready: '+onlyA.length+' / '+onlyB.length+' differing lines.'+(files.length>2?' (You added '+files.length+' files — the first two were compared.)':''))}
  if(id==='pdf-to-jpg'||id==='pdf-to-png'){const isPng=id==='pdf-to-png';const blobs=await renderPages(raw,parseFloat(opt('scale'))||2,isPng?'image/png':'image/jpeg',.92,(i,n)=>tick(i,n,isPng?'Converting pages to PNG':'Converting pages to JPG'));await zipOut(blobs.map((b,i)=>({blob:b,name:baseName(f)+'-page-'+(i+1)+(isPng?'.png':'.jpg')})),baseName(f)+'-images.zip');return done(blobs.length+' page image(s) created'+(blobs.length>1?' — downloaded as one ZIP file.':'.'))}
  if(id==='compress'){const level=opt('level');const cfg={extreme:{s:.8,q:.45},recommended:{s:1.2,q:.65},low:{s:1.8,q:.85}}[level]||{s:1.2,q:.65};const blobs=await renderPages(raw,cfg.s,'image/jpeg',cfg.q,(i,n)=>tick(i,n,'Compressing PDF'));const src=await PDFDocument.load(raw);const doc=await PDFDocument.create();for(let i=0;i<blobs.length;i++){const img=await doc.embedJpg(new Uint8Array(await blobs[i].arrayBuffer()));const sp=src.getPage(Math.min(i,src.getPageCount()-1));const page=doc.addPage([sp.getWidth(),sp.getHeight()]);page.drawImage(img,{x:0,y:0,width:page.getWidth(),height:page.getHeight()})}const outBytes=await doc.save();download(new Blob([outBytes],{type:'application/pdf'}),baseName(f)+'-compressed.pdf');
    if(outBytes.length>=raw.length)return done('Compressed ('+level+'), but the file did not get smaller ('+fmt(raw.length)+' to '+fmt(outBytes.length)+') — it was probably already well compressed. Note: output is image-based.','<strong>'+fmt(raw.length)+' '+icon('arrow-right',15)+' '+fmt(outBytes.length)+'</strong> · no smaller this time');
    const pct=Math.round((1-outBytes.length/raw.length)*100);return done('Compressed ('+level+'): '+fmt(raw.length)+' to '+fmt(outBytes.length)+' ('+pct+'% smaller). Note: image-based output — text becomes part of the page image.','<strong>'+fmt(raw.length)+' '+icon('arrow-right',15)+' '+fmt(outBytes.length)+'</strong> · '+pct+'% smaller')}
  if(id==='ocr'){
    if(!window.Tesseract)throw new Error('OCR library failed to load — check your connection and reload the page.');
    const max=parseInt(opt('pages'))||5;const pdf=await pdfjsLib.getDocument({data:raw.slice()}).promise;const n=Math.min(max,pdf.numPages);let allText='';let worker=null;
    const cancelP=new Promise((_,rej)=>{ocrCancelReject=rej});
    try{
      const startTimeoutP=new Promise((_,rej)=>setTimeout(()=>rej(new Error('OCR could not start — its language data could not be downloaded. Check your connection and try again.')),120000));
      worker=await Promise.race([Tesseract.createWorker('eng',1,{logger:m=>{if(m.status==='recognizing text'&&typeof m.progress==='number'){setProg(.05+(((ocrState.page-1)+m.progress)/n)*.85,'Reading text — page '+ocrState.page+' of '+n+' ('+Math.round(m.progress*100)+'%)')}else if(m.status){setProg(undefined,'OCR: '+m.status+'…')}}}),cancelP,startTimeoutP]);
      ocrWorker=worker;
      for(let i=1;i<=n;i++){if(jobCancelled)throw cancelError();ocrState.page=i;
        const pg=await pdf.getPage(i);const vp=pg.getViewport({scale:2});const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
        const timeoutP=new Promise((_,rej)=>setTimeout(()=>rej(new Error('OCR timed out on page '+i+' — try fewer pages, or a clearer, smaller scan.')),180000));
        const res=await Promise.race([worker.recognize(c),cancelP,timeoutP]);
        allText+='\n\n--- Page '+i+' ---\n'+res.data.text;tick(i,n,'Reading text (OCR)')}
    } finally {ocrCancelReject=null;if(worker){try{await worker.terminate()}catch(e){}}if(ocrWorker===worker)ocrWorker=null}
    if(jobCancelled)throw cancelError();
    const doc=await textToPdfDoc(allText,baseName(f)+' OCR');await saveDoc(doc,baseName(f)+'-ocr.pdf');download(new Blob([allText],{type:'text/plain'}),baseName(f)+'-ocr.txt');
    const words=allText.trim()?allText.trim().split(/\s+/).length:0;
    return done(words<10?'OCR finished, but found almost no readable text — the scan may be blank or too blurry. The results were still downloaded so you can check them.':'OCR finished for '+n+' page(s). A searchable PDF and a plain-text file were downloaded.')}
  if(id==='pdf-to-word'){const pages=await extractText(raw,(i,n)=>tick(i,n,'Reading pages'));download(await makeDocx(pages,baseName(f)),baseName(f)+'.docx');return done('Word file created (Beta, text-based — layout simplified).')}
  if(id==='pdf-to-excel'){const pages=await extractText(raw,(i,n)=>tick(i,n,'Reading pages'));const rows=[];let maxCols=1;pages.forEach((p,pi)=>p.split('\n').forEach(l=>{const cells=l.split(/\s{2,}/).map(s=>s.trim()).filter(s=>s.length);const row=['Page '+(pi+1),...(cells.length?cells:[l.trim()])];if(row.length-1>maxCols)maxCols=row.length-1;rows.push(row)}));
    const header=['Page',...Array.from({length:maxCols},(_,i)=>'Column '+(i+1))];const full=[header,...rows.map(r=>[...r,...Array(Math.max(0,maxCols-(r.length-1))).fill('')])];
    if(window.XLSX){const ws=XLSX.utils.aoa_to_sheet(full);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Extracted');const out=XLSX.write(wb,{bookType:'xlsx',type:'array'});download(new Blob([out],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),baseName(f)+'.xlsx')}else{download(new Blob([full.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n')],{type:'text/csv'}),baseName(f)+'.csv')}return done('Spreadsheet created (Beta — text split into rows/columns by spacing; table layout is not preserved).')}
  if(id==='unlock'){
    const looksEnc=(()=>{try{const td=new TextDecoder('latin1');const head=td.decode(raw.slice(0,65536));const tail=td.decode(raw.slice(Math.max(0,raw.length-65536)));return head.includes('/Encrypt')||tail.includes('/Encrypt')}catch(e){return false}})();
    let opened=null,needsPw=false;
    try{opened=await pdfjsLib.getDocument({data:raw.slice()}).promise}catch(e){if(e&&e.name==='PasswordException'||/password/i.test((e&&e.message)||''))needsPw=true;else throw e}
    const pw=opt('password');
    if(opened&&!looksEnc)return infoDone('This PDF isn\'t password-protected — there is nothing to unlock. Your file was left unchanged.');
    if(opened&&looksEnc){
      try{const d=await PDFDocument.load(raw,{ignoreEncryption:true});const outBytes=await d.save();const chk=await pdfjsLib.getDocument({data:outBytes.slice()}).promise;if(chk.numPages===opened.numPages){download(new Blob([outBytes],{type:'application/pdf'}),baseName(f)+'-unlocked.pdf');return done('Unlocked — protection removed, text preserved.')}}catch(e){/* fall through to password path */}
      if(!pw)throw new Error('This file\'s protection could not be removed automatically. Enter its current password above and try again — files protected with AURELIA unlock with the password you set on them.');
    }
    if(needsPw||looksEnc){
      if(!pw)throw new Error('This PDF is locked with a password. Enter its current password above — AURELIA can only unlock files you own and know the password for.');
      let pdf2;try{pdf2=await pdfjsLib.getDocument({data:raw.slice(),password:pw}).promise}catch(e){throw new Error('That password didn\'t work. Check it and try again.')}
      const doc2=await PDFDocument.create();
      for(let i=1;i<=pdf2.numPages;i++){const pg=await pdf2.getPage(i);const vp=pg.getViewport({scale:2});const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));const img=await doc2.embedJpg(new Uint8Array(await blob.arrayBuffer()));const base=pg.getViewport({scale:1});const page=doc2.addPage([base.width,base.height]);page.drawImage(img,{x:0,y:0,width:base.width,height:base.height});tick(i,pdf2.numPages,'Unlocking')}
      await saveDoc(doc2,baseName(f)+'-unlocked.pdf');return done('Unlocked with your password and rebuilt without protection. Note: rebuilt pages are images (text not selectable).')}
    return infoDone('This PDF isn\'t password-protected — there is nothing to unlock. Your file was left unchanged.')}

  // pdf-lib tools
  let doc;try{doc=await PDFDocument.load(raw,{ignoreEncryption:id==='repair'})}catch(e){if(id==='repair')throw new Error('This file is too damaged to fix in the browser — your original file is unchanged.');throw e}
  const total=doc.getPageCount();
  if(id==='split'){const items=[];if(opt('mode')==='pick'){if(!(pm&&pm.mode==='pick'&&pm.sel.size))throw new Error('Tap at least one page in the preview above first.');const idx=[...pm.sel].sort((a,b)=>a-b);const d=await PDFDocument.create();(await d.copyPages(doc,idx)).forEach(p=>d.addPage(p));await saveDoc(d,baseName(f)+'-picked.pdf');return done('Extracted '+idx.length+' picked page(s) as one PDF.')}if(opt('mode')==='each'){for(let i=0;i<total;i++){const d=await PDFDocument.create();const [p]=await d.copyPages(doc,[i]);d.addPage(p);items.push({blob:new Blob([await d.save()],{type:'application/pdf'}),name:baseName(f)+'-page-'+(i+1)+'.pdf'});tick(i+1,total,'Splitting PDF')}}else{const ranges=opt('ranges').split(',').map(s=>s.trim()).filter(Boolean);for(let r=0;r<ranges.length;r++){const idx=parseRanges(ranges[r],total);if(!idx)continue;const d=await PDFDocument.create();(await d.copyPages(doc,idx)).forEach(p=>d.addPage(p));items.push({blob:new Blob([await d.save()],{type:'application/pdf'}),name:baseName(f)+'-part-'+(r+1)+'.pdf'})}}if(!items.length)throw new Error('No valid ranges — check the ranges under Advanced options (e.g. 1-3, 4-6).');await zipOut(items,baseName(f)+'-split.zip');return done('Split into '+items.length+' file(s)'+(items.length>1?' — downloaded as one ZIP file.':'.'))}
  if(id==='remove-pages'){const rm=new Set((pm&&pm.mode==='remove'&&pm.sel.size)?[...pm.sel]:(parseRanges(opt('pages'),total)||[]));if(!rm.size)throw new Error('Tap pages in the preview above to mark them for removal — or type page numbers under Advanced options.');if(rm.size>=total)throw new Error('You cannot remove every page — keep at least one.');[...rm].sort((a,b)=>b-a).forEach(i=>doc.removePage(i));await saveDoc(doc,baseName(f)+'-trimmed.pdf');return done('Removed '+rm.size+' page(s). '+doc.getPageCount()+' remain.')}
  if(id==='extract-pages'){let idx=null;if(pm&&pm.mode==='extract'&&pm.sel.size)idx=[...pm.sel].sort((a,b)=>a-b);else if(opt('pages').trim())idx=parseRanges(opt('pages'),total);if(!idx||!idx.length)throw new Error('Tap at least one page in the preview above first — or type page numbers under Advanced options.');const d=await PDFDocument.create();(await d.copyPages(doc,idx)).forEach(p=>d.addPage(p));await saveDoc(d,baseName(f)+'-extract.pdf');return done('Extracted '+idx.length+' page(s) into a new PDF.')}
  if(id==='organize'){
    if(pm&&pm.mode==='organize'){const seq=pm.order.filter(i=>i<0||!pm.deleted.has(i));if(!seq.length)throw new Error('Every page was removed — keep at least one page.');const d=await PDFDocument.create();let lastSize=[595,842];for(const ix of seq){if(ix<0){d.addPage(lastSize)}else{const [p]=await d.copyPages(doc,[ix]);d.addPage(p);lastSize=[p.getWidth(),p.getHeight()]}}await saveDoc(d,baseName(f)+'-reordered.pdf');return done('New document saved with '+seq.length+' page(s)'+(pm.deleted.size?' — '+pm.deleted.size+' page(s) removed':'')+(pm.blanks?' — including '+pm.blanks+' blank page(s)':'')+'.')}
    const idx=parseRanges(opt('order'),total);if(!idx||idx.length!==total)throw new Error('Order must list every page exactly once (1 to '+total+').');const d=await PDFDocument.create();(await d.copyPages(doc,idx)).forEach(p=>d.addPage(p));await saveDoc(d,baseName(f)+'-reordered.pdf');return done('Pages reordered.')}
  if(id==='rotate'){
    /* Snapshot the thumbnail rotations up front (audit fix #2): the run then
       depends only on local state — plus the global busy-lock and error
       surfacing mean a click can never again vanish silently. */
    const rotSnapshot=(pm&&pm.mode==='rotate')?{...pm.rot}:null;
    if(rotSnapshot&&Object.values(rotSnapshot).some(a=>a)){let n=0;Object.entries(rotSnapshot).forEach(([i,a])=>{if(!a)return;const p=doc.getPage(+i);p.setRotation(degrees((p.getRotation().angle+a)%360));n++});await saveDoc(doc,baseName(f)+'-rotated.pdf');return done('Rotated '+n+' page(s) from the thumbnails.')}
    const idx=opt('pages').trim()?(parseRanges(opt('pages'),total)||[]):doc.getPageIndices();idx.forEach(i=>{const p=doc.getPage(i);p.setRotation(degrees((p.getRotation().angle+parseInt(opt('angle')))%360))});await saveDoc(doc,baseName(f)+'-rotated.pdf');return done('Rotated '+idx.length+' page(s) by '+opt('angle')+'°.')}
  if(id==='crop'){doc.getPages().forEach(p=>{const {width,height}=p.getSize();const l=+opt('left')||0,r=+opt('right')||0,t=+opt('top')||0,b=+opt('bottom')||0;p.setCropBox(l,b,Math.max(50,width-l-r),Math.max(50,height-t-b))});await saveDoc(doc,baseName(f)+'-cropped.pdf');return done('Cropped all pages with the same trim.')}
  if(id==='repair'){await saveDoc(doc,baseName(f)+'-repaired.pdf');return done('Repaired / cleanly re-saved. Pages: '+total+'. If the original already opened fine, it may not have needed repair.')}
  if(id==='page-numbers'){const font=await doc.embedFont(StandardFonts.Helvetica);const pos=opt('position'),fmtOpt=opt('format'),first=parseInt(opt('first'))||1;doc.getPages().forEach((p,i)=>{const {width,height}=p.getSize();const num=first+i;const label=fmtOpt==='n'?String(num):fmtOpt==='Page n'?'Page '+num:num+' / '+(first+total-1);const tw=font.widthOfTextAtSize(label,10);let x=(width-tw)/2;if(pos.includes('left'))x=36;if(pos.includes('right'))x=width-tw-36;let y=24;if(pos.startsWith('top'))y=height-30;else if(pos.startsWith('middle'))y=height/2;p.drawText(label,{x,y,size:10,font,color:rgb(.25,.25,.25)})});await saveDoc(doc,baseName(f)+'-numbered.pdf');return done('Page numbers added — starting at '+first+', at the '+POS_WORDS[pos]+' of every page.')}
  if(id==='watermark'){const font=await doc.embedFont(StandardFonts.HelveticaBold);const text=opt('text')||'AURELIA';const size=parseFloat(opt('size'))||42;const op=Math.min(.6,Math.max(.05,parseFloat(opt('opacity'))||.18));const pos=opt('position');doc.getPages().forEach(p=>{const {width,height}=p.getSize();const tw=font.widthOfTextAtSize(text,size);let cx=width/2;if(pos.includes('left'))cx=tw/2+36;if(pos.includes('right'))cx=width-tw/2-36;let cy=height/2;if(pos.startsWith('top'))cy=height-size*.8;if(pos.startsWith('bottom'))cy=size*.9;p.drawText(text,{x:cx-tw/2,y:cy-size*.35,size,font,color:rgb(.55,.6,.7),opacity:op,rotate:pos==='center'?degrees(35):degrees(0)})});await saveDoc(doc,baseName(f)+'-watermarked.pdf');return done('Watermark added at the '+POS_WORDS[pos]+' of every page.')}
  if(id==='edit-pdf'||id==='annotate'){
    const text=opt('text').trim();if(!text)throw new Error(id==='edit-pdf'?'Type the text you want to add first.':'Type your note text first.');
    let pi=(parseInt(opt('page'))||1)-1;let px=50,py=700,rect=null;
    if(ed&&ed.kind===id){
      if(id==='edit-pdf'){if(!ed.marker)throw new Error('Click on the page preview above to choose where the text goes.');pi=ed.marker.page;const s=doc.getPage(pi).getSize();px=ed.marker.fx*s.width;py=s.height-ed.marker.fy*s.height}
      if(id==='annotate'){if(!ed.rect)throw new Error('Drag a rectangle on the page preview above to place your note.');pi=ed.rect.page;const s=doc.getPage(pi).getSize();rect={x:ed.rect.fx*s.width,y:s.height-(ed.rect.fy+ed.rect.fh)*s.height,w:ed.rect.fw*s.width,h:ed.rect.fh*s.height}}}
    if(pi<0||pi>=total)throw new Error('Page out of range.');const p=doc.getPage(pi);const font=await doc.embedFont(StandardFonts.Helvetica);
    if(id==='annotate'){const lines0=wrapText(text,font,11,Math.max(40,(rect?rect.w:220)-16));const w=rect?rect.w:Math.max(140,Math.min(320,font.widthOfTextAtSize(text,11)+24)),h=rect?rect.h:Math.max(30,lines0.length*13+14),x=rect?rect.x:50,y=rect?rect.y:650;const lines=wrapText(text,font,11,Math.max(40,w-16));p.drawRectangle({x,y,width:w,height:h,color:rgb(1,.93,.55),opacity:.95});lines.forEach((l,li)=>p.drawText(l,{x:x+8,y:y+h-15-li*13,size:11,font,color:rgb(.05,.05,.05)}));await saveDoc(doc,baseName(f)+'-annotated.pdf');return done('Note added to page '+(pi+1)+(rect?' where you drew it.':'.'))}
    p.drawText(text,{x:px,y:py,size:parseFloat(opt('size'))||18,font,color:rgb(.05,.05,.05)});await saveDoc(doc,baseName(f)+'-edited.pdf');return done('Text added to page '+(pi+1)+(ed&&ed.marker?' where you clicked.':'.'))}
  if(id==='sign-pdf'){if(!sigDrawn||!sigArt)throw new Error('Create your signature first — draw it, type it, or upload a picture — then drag it into place on the preview.');
    const blob=await new Promise(r=>sigArt.toBlob(r,'image/png'));const img=await doc.embedPng(new Uint8Array(await blob.arrayBuffer()));const aspect=sigArt.height/sigArt.width;
    let pi=total-1,x=null,y=null,wPt=180;
    if(ed&&ed.kind==='sign-pdf'){pi=Math.min(ed.page,total-1);const s=doc.getPage(pi).getSize();wPt=ed.signW*s.width;x=ed.signPos.fx*s.width;y=s.height-ed.signPos.fy*s.height-wPt*aspect}
    const p=doc.getPage(pi);const s2=p.getSize();if(x===null){x=Math.max(20,s2.width-wPt-40);y=60}
    p.drawImage(img,{x,y,width:wPt,height:wPt*aspect});
    if($('sigDate')&&$('sigDate').checked){const font=await doc.embedFont(StandardFonts.Helvetica);const dstr=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});let dx=x+wPt+10,dy=y+2;if(dx+font.widthOfTextAtSize(dstr,11)>s2.width-8){dx=x;dy=y-16}if(dy<8)dy=y+wPt*aspect+6;p.drawText(dstr,{x:dx,y:dy,size:11,font,color:rgb(.1,.1,.1)})}
    await saveDoc(doc,baseName(f)+'-signed.pdf');return done('Signature stamped on page '+(pi+1)+' where you placed it.')}
  if(id==='redact'){
    if(!ed||ed.kind!=='redact'||!ed.boxes.length)throw new Error('Draw at least one black-out box on the preview first — nothing is redacted until you do.');
    /* TRUE redaction (audit fix #1): every page carrying a box is re-rendered
       to an image with the boxes burned in, and the page is REPLACED by that
       image — the original text layer ceases to exist. Untouched pages are
       copied across unchanged. */
    const byPage={};ed.boxes.forEach(bx=>{if(bx.page>=0&&bx.page<total)(byPage[bx.page]=byPage[bx.page]||[]).push(bx)});
    const srcPdf=await pdfjsLib.getDocument({data:raw.slice()}).promise;const out=await PDFDocument.create();
    for(let i=0;i<total;i++){
      if(!byPage[i]){const [cp]=await out.copyPages(doc,[i]);out.addPage(cp)}
      else{const sp=doc.getPage(i);const {width,height}=sp.getSize();const pg=await srcPdf.getPage(i+1);const vp=pg.getViewport({scale:200/72});const c=document.createElement('canvas');c.width=Math.round(vp.width);c.height=Math.round(vp.height);const g=c.getContext('2d');await pg.render({canvasContext:g,viewport:vp}).promise;g.fillStyle='#000';byPage[i].forEach(bx=>g.fillRect(bx.fx*c.width,bx.fy*c.height,bx.fw*c.width,bx.fh*c.height));const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));const img=await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));const page=out.addPage([width,height]);page.drawImage(img,{x:0,y:0,width,height})}
      tick(i+1,total,'Redacting')}
    await saveDoc(out,baseName(f)+'-redacted.pdf');return done('Redacted '+ed.boxes.length+' area(s) on '+Object.keys(byPage).length+' page(s). Those pages were flattened into images, so the hidden text is permanently removed — it cannot be copied back out.')}
  if(id==='metadata'){
    if(!metaLoaded&&!opt('clearmeta'))throw new Error('We could not read this file\'s current metadata, so nothing was changed — the file may be damaged or password-protected.');
    if(opt('clearmeta')){doc.setTitle('');doc.setAuthor('');doc.setSubject('');doc.setKeywords([]);await saveDoc(doc,baseName(f)+'-metadata.pdf');return done('All metadata cleared and saved.')}
    doc.setTitle(opt('title'));doc.setAuthor(opt('author'));doc.setSubject(opt('subject'));const kw=opt('keywords').trim();doc.setKeywords(kw?kw.split(',').map(s=>s.trim()).filter(Boolean):[]);
    await saveDoc(doc,baseName(f)+'-metadata.pdf');return done('Metadata saved — Title: “'+(opt('title')||'—')+'”, Author: “'+(opt('author')||'—')+'”.')}
  if(id==='protect'){if(!opt('password'))throw new Error('Enter a password.');if(opt('password')!==opt('confirm'))throw new Error('Passwords do not match.');if(typeof doc.encrypt!=='function')throw new Error('Encryption engine unavailable in this build.');doc.encrypt({userPassword:opt('password'),ownerPassword:opt('password'),permissions:{printing:'highResolution',modifying:false,copying:false,annotating:false,fillingForms:false,contentAccessibility:true,documentAssembly:false}});await saveDoc(doc,baseName(f)+'-protected.pdf');return done('PDF encrypted with your password. Keep it safe — it cannot be recovered if forgotten.')}
  if(id==='unlock'){throw new Error('Unlock is handled earlier in the pipeline.')}
  throw new Error('Unknown tool.');
}
async function makeDocx(pages,title){
  const escx=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const paras=pages.map(p=>p.split('\n').map(l=>`<w:p><w:r><w:t xml:space="preserve">${escx(l)}</w:t></w:r></w:p>`).join('')).join('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  const docXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}</w:body></w:document>`;
  const zip=new JSZip();zip.file('[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.folder('_rels').file('.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.folder('word').file('document.xml',docXml);
  return zip.generateAsync({type:'blob'});
}
renderTools();
