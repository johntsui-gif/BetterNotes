const $=id=>document.getElementById(id), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])), icon=n=>'<i data-lucide="'+n+'"></i>', icons=()=>lucide.createIcons(), uid=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join(''), fresh=()=>({w:750,h:960,marks:[],pdfPage:null}), palettes=['#d7e9df','#e6e0ed','#f4e0d3','#e5e9d9','#dfe5ed'];
let db,docs=[],folders=[],view='Library',layout=localStorage.layout||'grid',current=null,pg=0,tool='pen',color='#19453f',width=3,redo=[],gesture=null,recent=localStorage.recent,busySave=Promise.resolve(),pending=new Set(),toastTimer;
function notify(s){$('toast').textContent=s;$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',3800)}
function modal(title,html){$('dialogBody').innerHTML='<h2 class="modalTitle">'+esc(title)+'</h2>'+html;if(!$('modal').open)$('modal').showModal();icons()}
function closeModal(){$('modal').close()}
const req=r=>new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function write(doc){const tx=db.transaction('books','readwrite');tx.objectStore('books').put(doc);await new Promise((ok,no)=>{tx.oncomplete=ok;tx.onerror=()=>no(tx.error);tx.onabort=()=>no(tx.error)})}
function save(doc){doc.rev=uid();doc.time=Date.now();pending.add(doc.id);const copy=structuredClone(doc);busySave=busySave.catch(()=>{}).then(()=>write(copy)).catch(e=>{notify('Device save failed: '+e.message);throw e});window.scheduleSync?.();return busySave}
function make(title,cover,folder,pages=[fresh()]){return {id:uid(),title,folder,cover,pages,fav:false,time:Date.now(),rev:uid()}}
async function start(){const r=indexedDB.open('inkfolio-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('books',{keyPath:'id'});db=await req(r);docs=await req(db.transaction('books').objectStore('books').getAll());folders=JSON.parse(localStorage.folders||'["Personal","Work","Study"]');if(!docs.length&&!localStorage.initialized){for(const [i,title] of ['Field Notes','Design Journal','Ideas & Sketches','Daily Planner'].entries()){const d=make(title,i,['Personal','Work','Personal','Study'][i]);d.id='starter-'+i;d.rev='starter-1';d.time=0;docs.push(d);await write(d)}localStorage.initialized='1'}render()}
function navBtn(n,ic,folder=false){return '<button data-view="'+esc((folder?'folder:':'')+n)+'" class="'+(view===(folder?'folder:':'')+n?'active':'')+'">'+icon(ic)+esc(n)+'</button>'}
function render(){if(current)return;for(const d of docs)if(!d.deleted&&d.folder&&!folders.includes(d.folder))folders.push(d.folder);$('nav').innerHTML=navBtn('Library','library-big')+navBtn('Favorites','star')+navBtn('Recent','clock-3');$('folders').innerHTML=folderTree();const v=view.replace(/^folder:/,'');$('crumb').textContent=v;$('heading').textContent=view==='Library'?'My library':v;$('subtitle').textContent=view==='Library'?'A home for your notebooks, ideas, and collected thoughts.':view==='Favorites'?'Your starred notebooks, together in one place.':view==='Recent'?'Your most recently opened and edited notebooks.':'Notebooks in this folder.';const q=$('search').value.trim().toLowerCase(),live=docs.filter(d=>!d.deleted&&d.kind!=='elements'),list=live.filter(d=>(!view.startsWith('folder:')||d.folder===v)&&(view!=='Favorites'||d.fav)&&d.title.toLowerCase().includes(q)).sort((a,b)=>view==='Recent'?(Number(localStorage['open'+b.id])||b.time)-(Number(localStorage['open'+a.id])||a.time):b.time-a.time||a.id.localeCompare(b.id));const last=live.find(d=>d.id===recent)||list[0];$('feature').style.display=view==='Library'&&!q&&last?'flex':'none';if(last){$('recentTitle').textContent=last.title;$('recentMeta').textContent=(last.folder||'Library')+'   ·   '+last.pages.length+' '+(last.pages.length===1?'page':'pages');$('resume').onclick=()=>openDoc(last)}$('shelfTitle').textContent=q?'Search results':view==='Library'?'All notebooks':'Notebooks';$('count').textContent=list.length;$('books').className=layout==='list'?'list':'';$('gridBtn').className=layout==='grid'?'sel':'';$('listBtn').className=layout==='list'?'sel':'';$('books').innerHTML=list.map(d=>'<article class="card"><button class="preview" data-open="'+d.id+'" aria-label="Open '+esc(d.title)+'" style="--bg:'+palettes[d.cover]+'"><span class="bookcover" style="background-image:url(cover-'+d.cover+'.svg);--fg:'+([0,4].includes(d.cover)?'#f3edce':'#3b3b39')+'"><span class="coverTitle">'+esc(d.title)+'</span></span></button><div class="info"><div class="cardrow"><button class="booktitle" data-open="'+d.id+'">'+esc(d.title)+'</button><button class="more" data-menu="'+d.id+'" aria-label="Notebook options">'+icon('ellipsis')+'</button></div><small>'+esc(d.folder||'Library')+' &nbsp;·&nbsp; '+d.pages.length+' '+(d.pages.length===1?'page':'pages')+'</small></div></article>').join('')||'<p class="empty">No notebooks here yet.</p>';icons()}
function showLib(){pdfViewer.close();current=null;document.body.classList.remove('present');$('editor').hidden=true;$('library').hidden=false;render()}
function openDoc(d){current=d;tool='read';recent=localStorage.recent=d.id;localStorage['open'+d.id]=Date.now();pg=Math.min(Number(localStorage['pg'+d.id])||0,d.pages.length-1);redo=[];$('library').hidden=true;$('editor').hidden=false;$('crumb').textContent='Notebook';$('docTitle').textContent=d.title;drawPage()}
function changeView(v){view=v;$('search').value='';document.body.classList.remove('drawer');showLib()}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b){if(!e.target.closest('aside'))document.body.classList.remove('drawer');return}if(b.dataset.view)changeView(b.dataset.view);if(b.dataset.open)openDoc(docs.find(d=>d.id===b.dataset.open));if(b.dataset.menu)options(docs.find(d=>d.id===b.dataset.menu))});
$('gridBtn').onclick=()=>{layout=localStorage.layout='grid';render()};$('listBtn').onclick=()=>{layout=localStorage.layout='list';render()};$('hamb').onclick=()=>document.body.classList.toggle('drawer');$('search').oninput=()=>{if(current)showLib();render()};$('back').onclick=showLib;
function editForm(d){modal(d?'Notebook settings':'New notebook','<form id="bookForm"><label>Notebook name</label><input id="name" maxlength="120" required autofocus><label>Folder</label><select id="location"><option value="">Library</option>'+folders.map(f=>'<option>'+esc(f)+'</option>').join('')+'</select><label>Cover</label><select id="cover">'+['Tidal contours','Lavender arches','Desert sunset','Botanical study','Midnight sky'].map((s,i)=>'<option value="'+i+'">'+s+'</option>').join('')+'</select><button class="primary">'+(d?'Save changes':'Create notebook')+'</button></form>');$('name').value=d?.title||'';$('location').value=d?.folder||(view.startsWith('folder:')?view.slice(7):'');$('cover').value=d?.cover??0;$('bookForm').onsubmit=async e=>{e.preventDefault();const title=$('name').value.trim();if(!title)return;const doc=d||make(title,+$('cover').value,$('location').value);Object.assign(doc,{title,cover:+$('cover').value,folder:$('location').value});if(!d)docs.push(doc);await save(doc);closeModal();d?render():openDoc(doc)}}
$('create').onclick=()=>editForm();$('folderAdd').onclick=()=>{modal('New folder','<form id="folderForm"><label>Folder name</label><input id="fname" required maxlength="80"><button class="primary">Create folder</button></form>');$('folderForm').onsubmit=e=>{e.preventDefault();const n=$('fname').value.trim();if(!n)return;if(!folders.includes(n))folders.push(n);localStorage.folders=JSON.stringify(folders);closeModal();changeView('folder:'+n)}};
function options(d){modal(d.title,['Open notebook',d.fav?'Remove from favorites':'Add to favorites','Rename, move or change cover','Export editable backup','Delete notebook','Export annotated PDF'].map((s,i)=>'<button class="menuaction" data-choice="'+i+'">'+s+'</button>').join(''));$('dialogBody').onclick=e=>{const i=e.target.dataset.choice;if(i===undefined)return;$('dialogBody').onclick=null;closeModal();if(i==='0')openDoc(d);if(i==='1'){d.fav=!d.fav;save(d);render()}if(i==='2')editForm(d);if(i==='3'){const url=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=d.title+'.betternotes';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}if(i==='5')exportPDF(d).catch(err=>notify(err.message));if(i==='4'&&confirm('Delete “'+d.title+'”?')){d.deleted=true;save(d);render()}}}
$('modal').addEventListener('close',()=>{$('dialogBody').onclick=null});
$('install').onclick=()=>modal('Install BetterNotes','<p><b>iPhone or iPad</b><br>Open this site in Safari, tap Share, then Add to Home Screen.</p><p><b>Mac</b><br>Open this site in Safari and choose File → Add to Dock.</p>');
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();$('search').focus()}if(e.key==='Escape'&&document.body.classList.contains('present'))presentation();if(current&&!$('modal').open&&!e.target.closest('input,textarea,select,[contenteditable]')&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();historyStep(e.shiftKey)}});
const toolset={read:['mouse-pointer-2','Read · select text and follow links'],pen:['pen-tool','Pen · draw freehand'],highlight:['highlighter','Highlighter · mark a passage'],line:['minus','Line · drag between two points'],rect:['square','Rectangle · drag to size'],ellipse:['circle','Ellipse · drag to size'],arrow:['move-up-right','Arrow · drag toward the target'],text:['type','Text · tap the page to type'],erase:['eraser','Eraser · tap an annotation to remove it'],laser:['wand-sparkles','Laser · point or drag for a fading trail']};
let undoStack=[],initialPage,tipTimer,longUsed=false;
function toolBtn(id,ic,t,sel=false){return '<button data-tool="'+id+'" aria-label="'+esc(t)+'" data-tip="'+esc(t)+'" class="'+(sel?'on':'')+'">'+icon(ic)+'</button>'}
function toolbar(){const p=current.pages[pg];$('tools').innerHTML=Object.entries(toolset).map(([k,[ic,t]])=>toolBtn(k,ic,t,k===tool)).join('')+'<input id="color" type="color" aria-label="Ink color" data-tip="Choose ink color" value="'+color+'"><select id="weight" aria-label="Stroke width">'+[2,3,6,10].map(w=>'<option '+(width===w?'selected':'')+'>'+w+'</option>').join('')+'</select>'+toolBtn('undo','undo-2','Undo last edit')+toolBtn('redo','redo-2','Redo last edit');$('color').oninput=e=>color=e.target.value;$('weight').onchange=e=>width=+e.target.value;renderPageControls();icons()}
function pageTo(n){if(!current||!Number.isInteger(n)||n<0||n>=current.pages.length||gesture)return;pg=n;localStorage['pg'+current.id]=pg;drawPage()}
function element(tag,attrs){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el}
function mark(m){const [x,y]=m.points[0],[a,b]=m.points.at(-1);let tag='path',attr={};if(m.type==='rect'){tag='rect';attr={x:Math.min(x,a),y:Math.min(y,b),width:Math.abs(a-x),height:Math.abs(b-y)}}else if(m.type==='ellipse'){tag='ellipse';attr={cx:(a+x)/2,cy:(b+y)/2,rx:Math.abs(a-x)/2,ry:Math.abs(b-y)/2}}else if(m.type==='text'){const el=element('text',{x,y,fill:m.color,'font-size':16+m.width*2});el.textContent=m.text;return el}else{let pts=m.type==='line'||m.type==='arrow'?[[x,y],[a,b]]:m.points;attr.d='M'+pts.map(p=>p.join(' ')).join(' L');if(pts.length===1)attr.d+=' l.1 .1';if(m.type==='arrow'){const angle=Math.atan2(b-y,a-x),len=14;attr.d+=' M'+[a-len*Math.cos(angle-.5),b-len*Math.sin(angle-.5)].join(' ')+' L'+a+' '+b+' L'+[a-len*Math.cos(angle+.5),b-len*Math.sin(angle+.5)].join(' ')}}return element(tag,{...attr,fill:'none',stroke:m.color,'stroke-width':m.width,'stroke-linecap':'round','stroke-linejoin':'round',opacity:m.type==='highlight'?.34:1})}
function drawPage(){const p=current.pages[pg];if(initialPage!==p){undoStack=[];redo=[];initialPage=p}$('base').style.visibility='visible';if(p.image)$('base').src=p.image;else $('base').removeAttribute('src');$('paper').style.aspectRatio=p.w+'/'+p.h;$('ink').setAttribute('viewBox','0 0 '+p.w+' '+p.h);$('ink').replaceChildren(...p.marks.map((m,i)=>{const el=mark(m);el.dataset.index=i;return el}));toolbar();pdfViewer.show()}
function checkpoint(){undoStack.push(structuredClone(current.pages[pg].marks));if(undoStack.length>40)undoStack.shift();redo=[]}
function historyStep(forward){const from=forward?redo:undoStack,to=forward?undoStack:redo,p=current.pages[pg];if(!from.length)return;to.push(structuredClone(p.marks));p.marks=from.pop();save(current);drawPage()}
function presentation(){const on=document.body.classList.toggle('present');tool=on?'laser':'read';$('present').innerHTML=icon('presentation')+(on?'End presentation':'Present');drawPage()}
$('present').onclick=presentation;
function pointer(e){const svg=$('ink'),p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const v=p.matrixTransform(svg.getScreenCTM().inverse());return [Math.round(v.x*10)/10,Math.round(v.y*10)/10]}
function glow(pt){const el=element('circle',{cx:pt[0],cy:pt[1],r:5,fill:'#ff3153',stroke:'#ff9d9e','stroke-width':3,'pointer-events':'none'});el.style.filter='drop-shadow(0 0 3px #ff2543)';$('ink').append(el);el.animate([{opacity:1},{opacity:0}],{duration:650});setTimeout(()=>el.remove(),650)}
$('ink').onpointerdown=e=>{if(tool==='read'||gesture||e.button!==0)return;const pt=pointer(e),p=current.pages[pg];if(tool==='erase'){const i=e.target.dataset.index;if(i!=null){checkpoint();p.marks.splice(+i,1);save(current);drawPage()}return}if(tool==='text'){const value=prompt('Text to place on the page');if(value){checkpoint();p.marks.push({type:'text',points:[pt],text:value,color,width});save(current);drawPage()}return}$('ink').setPointerCapture(e.pointerId);gesture={id:e.pointerId,m:{type:tool,points:[pt],color:tool==='highlight'&&color==='#19453f'?'#ebc324':color,width:tool==='highlight'?width*5:width}};if(tool==='laser'){glow(pt);return}gesture.el=mark(gesture.m);$('ink').append(gesture.el)};
$('ink').onpointermove=e=>{if(tool==='laser'&&(!gesture||gesture.id===e.pointerId)){glow(pointer(e));return}if(!gesture||gesture.id!==e.pointerId)return;gesture.m.points.push(pointer(e));const el=mark(gesture.m);gesture.el.replaceWith(el);gesture.el=el};
$('ink').onpointerup=e=>{if(!gesture||e.pointerId!==gesture.id)return;if(gesture.m.type!=='laser'){gesture.m.points.push(pointer(e));checkpoint();current.pages[pg].marks.push(gesture.m);save(current);drawPage()}gesture=null};$('ink').onpointercancel=()=>{gesture?.el?.remove();gesture=null};
$('tools').onclick=e=>{const b=e.target.closest('[data-tool]');if(!b||longUsed)return;const k=b.dataset.tool;if(k==='undo'||k==='redo')historyStep(k==='redo');else{tool=k;toolbar();pdfViewer.updateMode()}};
function tip(b){const r=b.getBoundingClientRect(),t=$('tip');t.textContent=b.dataset.tip;t.style.display='block';t.style.left=Math.max(6,Math.min(r.left,innerWidth-t.offsetWidth-6))+'px';t.style.top=(r.bottom+5)+'px'}
function hideTip(){clearTimeout(tipTimer);$('tip').style.display='none'}
document.addEventListener('pointerover',e=>{const b=e.target.closest('[data-tip]');if(b&&e.pointerType==='mouse')tipTimer=setTimeout(()=>tip(b),450)});document.addEventListener('pointerout',hideTip);document.addEventListener('pointerdown',e=>{longUsed=false;const b=e.target.closest('[data-tip]');if(b&&e.pointerType!=='mouse')tipTimer=setTimeout(()=>{longUsed=true;tip(b)},500)});document.addEventListener('pointerup',()=>{clearTimeout(tipTimer);if(longUsed)setTimeout(hideTip,1500)});document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-tip]'))e.preventDefault()});
$('import').onclick=()=>{modal('Import notebooks','<p>In Goodnotes, export your notebook as a PDF with annotations included. Import a single PDF, a ZIP folder of PDFs, a JPG or PNG, or an BetterNotes backup. PDFs open in the integrated reader. Use Read to select text and follow links, or choose a drawing tool to annotate.</p><button class="primary" id="pick">Choose files</button>');$('pick').onclick=()=>$('file').click()};
const dataURL=blob=>new Promise((ok,no)=>{const r=new FileReader;r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(blob)});
async function readDocument(name,blob){const ext=name.split('.').pop().toLowerCase(),title=name.split('/').pop().replace(/\.[^.]+$/,''),folder=name.includes('/')?name.split('/').slice(0,-1).join('/'):(view.startsWith('folder:')?view.slice(7):'');let pages=[],originalPDF;if(ext==='goodnotes')throw Error('Export this notebook as PDF from Goodnotes first.');if(ext==='zip'){const zip=await JSZip.loadAsync(blob);const entries=Object.values(zip.files).filter(f=>!f.name.startsWith('__MACOSX/'));const dirs=entries.filter(f=>f.dir).map(f=>f.name.replace(/\/+$/,'' )).filter(Boolean);folders=[...new Set([...folders,...dirs])];localStorage.folders=JSON.stringify(folders);const files=entries.filter(f=>!f.dir&&!f.name.startsWith('__MACOSX')&&/\.(pdf|png|jpe?g)$/i.test(f.name));if(!files.length&&dirs.length&&entries.every(f=>f.dir))return;if(!files.length)throw Error('This ZIP has no PDF or image exports. Export the folder as PDF in Goodnotes.');for(const f of files)await readDocument(f.name,await f.async('blob'));return}if(ext==='pdf'){originalPDF=await dataURL(new Blob([blob],{type:'application/pdf'}));const pdfjs=await import('./pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc='./pdf.worker.min.mjs';const pdf=await pdfjs.getDocument({data:await blob.arrayBuffer(),useSystemFonts:true,isEvalSupported:false,standardFontDataUrl:'./standard_fonts/',cMapUrl:'./cmaps/',cMapPacked:true,wasmUrl:'./wasm/'}).promise;try{for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i),base=page.getViewport({scale:1});pages.push({w:base.width,h:base.height,marks:[],pdfPage:i});page.cleanup()}}finally{await pdf.destroy()}}else if(['jpg','jpeg','png'].includes(ext)){const image=await dataURL(new Blob([blob],{type:ext==='png'?'image/png':'image/jpeg'})),img=new Image;img.src=image;await img.decode();pages=[{w:img.width,h:img.height,marks:[],image}]}else if(['betternotes','inkfolio'].includes(ext)){const d=JSON.parse(await blob.text());if(!validDoc(d))throw Error('Invalid notebook backup');const imported={...d,id:uid(),deleted:false};await save(imported);docs.push(imported);return}else throw Error('Unsupported file type');const d=make(title,docs.length%5,folder,pages);if(originalPDF)d.originalPDF=originalPDF;await save(d);docs.push(d)}
function validDoc(d){return d&&(!d.originalPDF||(typeof d.originalPDF==='string'&&/^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/.test(d.originalPDF)))&&typeof d.title==='string'&&Number.isInteger(d.cover)&&d.cover>=0&&d.cover<5&&Array.isArray(d.pages)&&d.pages.length&&d.pages.every(p=>p.w>0&&p.h>0&&(p.pdfPage===undefined||p.pdfPage===null||(Number.isInteger(p.pdfPage)&&p.pdfPage>0))&&(!p.image||/^data:image\/(png|jpeg);base64,/.test(p.image))&&Array.isArray(p.marks)&&p.marks.every(m=>toolset[m.type]&&typeof m.color==='string'&&/^#[a-f\d]{6}$/i.test(m.color)&&Number.isFinite(m.width)&&m.points?.length&&m.points.every(v=>v.length===2&&v.every(Number.isFinite))))}
$('file').onchange=async e=>{const files=[...e.target.files];e.target.value='';closeModal();if(!files.length)return;notify('Importing documents…');try{for(const f of files)await readDocument(f.name,f);notify('Import complete')}catch(err){modal('Import details','<p>'+esc(err.message)+'</p>')}render()};
start().catch(e=>notify('Could not open local storage: '+e.message));if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>notify('Offline installation is unavailable in this browser.'));
async function exportPDF(d){
  notify('Preparing annotated PDF…');
  if(!window.PDFLib)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='./pdf-lib.min.js';s.onload=resolve;s.onerror=()=>reject(Error('PDF export could not load'));document.head.append(s)});
  const pdf=await PDFLib.PDFDocument.create();
  const source=d.originalPDF?await openPDF(d.originalPDF):null;
  try {
  for(const [pageIndex,p] of d.pages.entries()){
    const scale=Math.min(2,2400/Math.max(p.w,p.h)),c=document.createElement('canvas');c.width=Math.ceil(p.w*scale);c.height=Math.ceil(p.h*scale);
    const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);
    const sourceNumber=source?pdfPageNumber(d.pages[pageIndex],pageIndex,source.numPages):null;
    if(sourceNumber){const original=await source.getPage(sourceNumber);await original.render({canvasContext:ctx,viewport:original.getViewport({scale})}).promise;}else if(p.image){const im=new Image();im.src=p.image;await im.decode();ctx.drawImage(im,0,0,c.width,c.height)}
    const svg=element('svg',{xmlns:'http://www.w3.org/2000/svg',width:c.width,height:c.height,viewBox:'0 0 '+p.w+' '+p.h});svg.append(...p.marks.map(mark));
    const overlay=new Image();overlay.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));await overlay.decode();ctx.drawImage(overlay,0,0);
    const image=await pdf.embedPng(c.toDataURL());pdf.addPage([p.w,p.h]).drawImage(image,{x:0,y:0,width:p.w,height:p.h});c.width=1
  }
  } finally { if(source)await source.destroy(); }
  const url=URL.createObjectURL(new Blob([await pdf.save()],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download=d.title+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);notify('PDF exported')
}

const expandedFolders=new Set();
function folderTree(){
  const root=new Map();
  for(const path of folders){
    let branch=root;
    for(const part of path.split('/').filter(Boolean)){
      if(!branch.has(part))branch.set(part,new Map());
      branch=branch.get(part);
    }
  }
  function branchHTML(branch,parent=''){
    return [...branch].map(([name,children])=>{
      const path=parent?parent+'/'+name:name;
      const label='<button data-view="folder:'+esc(path)+'" class="'+(view==='folder:'+path?'active':'')+'">'+icon('folder')+esc(name)+'</button>';
      if(!children.size)return label;
      return '<details data-path="'+esc(path)+'" '+(expandedFolders.has(path)?'open':'')+'><summary style="cursor:pointer;padding:7px">'+esc(name)+'</summary><div style="padding-left:12px;border-left:1px solid #bdcec5">'+label+branchHTML(children,path)+'</div></details>';
    }).join('');
  }
  return branchHTML(root);
}
$('folders').addEventListener('toggle',e=>{
  const path=e.target.dataset.path;
  if(path)e.target.open?expandedFolders.add(path):expandedFolders.delete(path);
},true);
const drawerClose=document.createElement('button');
drawerClose.id='drawerClose';
drawerClose.type='button';
drawerClose.setAttribute('aria-label','Close navigation');
drawerClose.textContent='×';
$('side').prepend(drawerClose);
const drawerBackdrop=document.createElement('button');
drawerBackdrop.id='drawerBackdrop';
drawerBackdrop.setAttribute('aria-label','Close navigation');
drawerBackdrop.tabIndex=-1;
document.body.append(drawerBackdrop);
$('hamb').setAttribute('aria-controls','side');
function closeDrawer(){
  document.body.classList.remove('drawer');
  $('hamb').focus();
}
drawerClose.onclick=closeDrawer;
drawerBackdrop.onclick=closeDrawer;
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&document.body.classList.contains('drawer'))closeDrawer();
});
const drawerObserver=new MutationObserver(()=>{
  const open=document.body.classList.contains('drawer');
  $('hamb').setAttribute('aria-expanded',String(open));
  if(open)drawerClose.focus();
});
drawerObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
$('hamb').setAttribute('aria-expanded','false');

async function openPDF(dataURL) {
  const pdfjs=await import('./pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc='./pdf.worker.min.mjs';
  const bytes=Uint8Array.from(atob(dataURL.split(',')[1]),ch=>ch.charCodeAt(0));
  return pdfjs.getDocument({data:bytes,isEvalSupported:false,useSystemFonts:true,
    standardFontDataUrl:'./standard_fonts/',cMapUrl:'./cmaps/',cMapPacked:true,wasmUrl:'./wasm/'}).promise;
}

const pdfViewer=(()=>{
  const controls=document.createElement('div');
  controls.id='readerControls';
  controls.innerHTML='<button id="zoomOut" aria-label="Zoom out">−</button><output id="zoomValue">Fit</output><button id="zoomIn" aria-label="Zoom in">+</button><button id="fitPage">Fit width</button><form id="findPDF"><input id="findQuery" type="search" placeholder="Find in PDF" aria-label="Find in PDF"><button>Find</button></form><button id="findPrevious" aria-label="Previous search result">‹</button><button id="findNext" aria-label="Next search result">›</button><span id="findStatus" role="status"></span>';
  $('paperWrap').before(controls);
  const status=document.createElement('div');
  status.id='readerStatus';status.setAttribute('role','status');
  controls.after(status);
  const surface=document.createElement('div');
  surface.id='pdfSurface';
  $('paper').insertBefore(surface,$('ink'));
  let source=null,owner=null,loading=null,generation=0,renderTask=null,textTask=null;
  let zoom=null,lastKey='',query='',hits=[],hitIndex=-1,searchGeneration=0;
  const textCache=new Map();

  function updateMode(){
    const reading=tool==='read';
    $('ink').style.pointerEvents=reading?'none':'auto';
    surface.classList.toggle('reading',reading);
  }
  function close(){
    generation++;searchGeneration++;lastKey='';
    renderTask?.cancel();textTask?.cancel();
    source?.destroy();source=null;owner=null;loading=null;
    surface.replaceChildren();$('paper').style.width='';$('paper').style.maxWidth='';
    $('paper').style.height='';controls.hidden=true;status.textContent='';$('base').style.visibility='visible';
  }
  async function documentFor(doc){
    if(owner===doc)return loading;
    close();owner=doc;zoom=null;query='';hits=[];hitIndex=-1;textCache.clear();
    $('findQuery').value='';$('findStatus').textContent='';
    loading=openPDF(doc.originalPDF).then(pdf=>{
      if(owner!==doc){pdf.destroy();throw Error('Reader closed');}
      source=pdf;return pdf;
    });
    return loading;
  }
  async function show(){
    updateMode();
    if(!current?.originalPDF){
      if(owner)close();
      controls.hidden=true;
      return;
    }
    const doc=current,index=pg;
    let pdf;
    try{pdf=await documentFor(doc);}catch(error){
      if(current===doc)status.textContent='Unable to open PDF: '+error.message;
      return;
    }
    if(current!==doc||pg!==index)return;
    controls.hidden=false;
    const sourceNumber=pdfPageNumber(doc.pages[index],index,pdf.numPages);
    if(!sourceNumber){
      generation++;renderTask?.cancel();textTask?.cancel();surface.replaceChildren();
      $('paper').style.width='';$('paper').style.height='';lastKey='';status.textContent='';
      return;
    }
    const available=Math.max(160,$('paperWrap').clientWidth-40);
    const page=await pdf.getPage(sourceNumber);
    if(current!==doc||pg!==index)return;
    const base=page.getViewport({scale:1});
    const scale=zoom??Math.min(available/base.width,1.6);
    const key=doc.id+'/'+index+'/'+sourceNumber+'/'+scale+'/'+devicePixelRatio;
    if(lastKey===key)return;
    lastKey=key;
    const job=++generation;
    renderTask?.cancel();textTask?.cancel();
    status.textContent='Rendering page…';
    surface.replaceChildren();
    $('base').style.visibility='hidden';
    const viewport=page.getViewport({scale});
    const paper=$('paper');
    paper.style.maxWidth='none';paper.style.width=viewport.width+'px';paper.style.height=viewport.height+'px';
    paper.style.setProperty('--scale-factor',scale);
    paper.style.setProperty('--total-scale-factor',scale);
    paper.style.setProperty('--scale-round-x','1px');paper.style.setProperty('--scale-round-y','1px');
    $('zoomValue').textContent=Math.round(scale*100)+'%';
    const canvas=document.createElement('canvas');
    const ratio=Math.min(devicePixelRatio||1,2,Math.sqrt(16000000/(viewport.width*viewport.height)));
    canvas.width=Math.ceil(viewport.width*ratio);canvas.height=Math.ceil(viewport.height*ratio);
    canvas.style.width='100%';canvas.style.height='100%';
    surface.append(canvas);
    try{
      renderTask=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[ratio,0,0,ratio,0,0]});
      await renderTask.promise;
      if(job!==generation)return;
      const pdfjs=await import('./pdf.min.mjs');
      const textContainer=document.createElement('div');
      textContainer.className='textLayer';
      surface.append(textContainer);
      textTask=new pdfjs.TextLayer({textContentSource:await page.getTextContent(),container:textContainer,viewport});
      await textTask.render();
      if(job!==generation)return;
      highlight();
      const annotations=await page.getAnnotations();
      if(job!==generation)return;
      const links=document.createElement('div');links.className='pdfLinks';surface.append(links);
      for(const annotation of annotations){
        if(annotation.subtype!=='Link'||!annotation.rect)continue;
        const rect=viewport.convertToViewportRectangle(annotation.rect);
        const link=document.createElement('a');
        link.style.left=Math.min(rect[0],rect[2])+'px';link.style.top=Math.min(rect[1],rect[3])+'px';
        link.style.width=Math.abs(rect[2]-rect[0])+'px';link.style.height=Math.abs(rect[3]-rect[1])+'px';
        link.setAttribute('aria-label',annotation.url||'Go to linked page');
        if(annotation.url){
          let url;try{url=new URL(annotation.url);}catch{continue;}
          if(!['https:','http:','mailto:'].includes(url.protocol))continue;
          link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';
        }else if(annotation.dest){
          link.href='#';
          link.onclick=async event=>{
            event.preventDefault();
            try{
              const dest=typeof annotation.dest==='string'?await pdf.getDestination(annotation.dest):annotation.dest;
              if(!dest)return;
              const target=typeof dest[0]==='number'?dest[0]:await pdf.getPageIndex(dest[0]);
              if(current===doc){
                const mapped=doc.pages.findIndex((p,i)=>pdfPageNumber(p,i,pdf.numPages)===target+1);
                if(mapped>=0)pageTo(mapped);else notify('The linked page has been deleted.');
              }
            }catch{notify('This PDF link could not be opened.');}
          };
        }else continue;
        links.append(link);
      }
      status.textContent='';
    }catch(error){
      if(job===generation&&error.name!=='RenderingCancelledException'&&error.name!=='AbortException'){
        lastKey='';status.textContent='PDF display error: '+error.message;
      }
    }
  }
  function highlight(){
    for(const span of surface.querySelectorAll('.textLayer span')){
      span.classList.toggle('pdfMatch',Boolean(query)&&span.textContent.toLowerCase().includes(query));
    }
  }
  async function find(){
    const doc=current;
    if(!doc?.originalPDF)return;
    const pdf=await documentFor(doc),run=++searchGeneration;
    query=$('findQuery').value.trim().toLowerCase();hits=[];hitIndex=-1;
    if(!query){$('findStatus').textContent='';highlight();return;}
    $('findStatus').textContent='Searching…';
    try{
      for(let i=0;i<doc.pages.length;i++){
        const sourceNumber=pdfPageNumber(doc.pages[i],i,pdf.numPages);
        if(!sourceNumber)continue;
        if(run!==searchGeneration||current!==doc)return;
        if(!textCache.has(sourceNumber)){
          const page=await pdf.getPage(sourceNumber),content=await page.getTextContent();
          textCache.set(sourceNumber,content.items.map(item=>item.str||'').join(' ').toLowerCase());
        }
        if(textCache.get(sourceNumber).includes(query))hits.push(i);
      }
      if(run!==searchGeneration||current!==doc)return;
      if(!hits.length){$('findStatus').textContent='No matching text';highlight();return;}
      moveHit(1);
    }catch(error){if(run===searchGeneration)$('findStatus').textContent='Search unavailable';}
  }
  function moveHit(direction){
    if(!hits.length)return;
    hitIndex=(hitIndex+direction+hits.length)%hits.length;
    $('findStatus').textContent='Matching page '+(hitIndex+1)+' of '+hits.length;
    pageTo(hits[hitIndex]);highlight();
  }
  function setZoom(value){zoom=Math.max(.25,Math.min(4,value));lastKey='';show();}
  $('zoomIn').onclick=()=>setZoom((zoom||parseFloat($('zoomValue').textContent)/100||1)*1.25);
  $('zoomOut').onclick=()=>setZoom((zoom||parseFloat($('zoomValue').textContent)/100||1)/1.25);
  $('fitPage').onclick=()=>{zoom=null;lastKey='';show();};
  $('findPDF').onsubmit=event=>{event.preventDefault();find().catch(()=>notify('Unable to search PDF'));};
  $('findPrevious').onclick=()=>moveHit(-1);$('findNext').onclick=()=>moveHit(1);
  let resizeTimer;
  new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(current?.originalPDF)show();},150);}).observe($('paperWrap'));
  controls.hidden=true;
  return {show,close,updateMode,getDocument:documentFor};
})();

function pdfPageNumber(page,index,total){
  if(page.pdfPage===null)return null;
  const number=page.pdfPage===undefined?index+1:page.pdfPage;
  return Number.isInteger(number)&&number>0&&number<=total?number:null;
}

function renderPageControls(){
  const count=current.pages.length;
  function navigation(id,label,graphic,disabled){
    return '<button id="'+id+'" class="pageNavigation" aria-label="'+label+'" title="'+label+'" '+(disabled?'disabled':'')+'>'+icon(graphic)+'<span>'+label.replace(' page','')+'</span></button>';
  }
  $('pages').innerHTML=
    '<div class="pageNavigationGroup">'+
    navigation('firstPage','First page','chevrons-left',pg===0)+
    navigation('prev','Previous page','chevron-left',pg===0)+
    '<form id="pageJump"><label for="pageNumber">Page</label><input id="pageNumber" type="number" inputmode="numeric" min="1" max="'+count+'" value="'+(pg+1)+'" aria-label="Page number"><span>of '+count+'</span><button type="submit" title="Go to page">Go</button></form>'+
    navigation('next','Next page','chevron-right',pg===count-1)+
    navigation('lastPage','Last page','chevrons-right',pg===count-1)+
    '</div><div class="pageActions"><button id="addpage" class="outline">'+icon('plus')+'Add page</button><button id="deletePage" class="deletePage">'+icon('trash-2')+'Delete page</button></div>';
  $('firstPage').onclick=()=>pageTo(0);
  $('prev').onclick=()=>pageTo(pg-1);
  $('next').onclick=()=>pageTo(pg+1);
  $('lastPage').onclick=()=>pageTo(current.pages.length-1);
  $('pageJump').onsubmit=event=>{
    event.preventDefault();
    const value=Number($('pageNumber').value);
    if(Number.isInteger(value)&&value>=1&&value<=current.pages.length)pageTo(value-1);
    else notify('Enter a page number from 1 to '+current.pages.length+'.');
  };
  $('addpage').onclick=()=>{current.pages.push(fresh());save(current);pageTo(current.pages.length-1);};
  $('deletePage').onclick=confirmPageDeletion;
}

function confirmPageDeletion(){
  if(!current||gesture)return;
  const doc=current,index=pg,page=doc.pages[index];
  modal('Delete page '+(index+1)+'?',
    '<p>This removes this page and its annotations from this notebook and future PDF exports.'+
    (doc.pages.length===1?' A blank page will replace the final page.':'')+
    '</p><div class="deleteActions"><button id="cancelDelete" class="outline">Cancel</button><button id="confirmDelete" class="primary">Delete page</button></div>');
  $('cancelDelete').onclick=closeModal;
  $('confirmDelete').onclick=async()=>{
    const button=$('confirmDelete');
    button.disabled=true;button.textContent='Deleting…';
    try{
      let total=0;
      if(doc.originalPDF){
        const pdf=await openPDF(doc.originalPDF);
        total=pdf.numPages;await pdf.destroy();
      }
      if(current!==doc||doc.pages[index]!==page)throw Error('The notebook changed. Please try again.');
      const candidate=structuredClone(doc);
      // Freeze legacy positional references before changing the array order.
      candidate.pages.forEach((p,i)=>{p.pdfPage=pdfPageNumber(p,i,total);});
      candidate.pages.splice(index,1);
      if(!candidate.pages.length)candidate.pages.push(fresh());
      await save(candidate);
      Object.assign(doc,candidate);
      pdfViewer.close();
      pg=Math.min(index,doc.pages.length-1);
      localStorage['pg'+doc.id]=pg;
      initialPage=null;undoStack=[];redo=[];
      closeModal();drawPage();notify('Page deleted.');
    }catch(error){
      button.disabled=false;button.textContent='Delete page';
      notify('Page could not be deleted: '+error.message);
    }
  };
}

