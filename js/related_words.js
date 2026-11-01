/* An index of attested HSK words containing a character, not invented meanings. */
const RelatedWords = {index:null,byId:null,char:'',context:'all',query:'',level:'all',mode:'list',limit:12,exclude:''};
const RELATED_PRIORITY = {
  '人':['人们','男人','女人','家人','别人','中国人'],
  '手':['手机','手表','手工','手套','右手','左手'],
  '水':['水果','开水','河水','水杯','水里','喝水'],
  '日':['日记','生日','日光','日子'],
  '月':['月亮','月光','月球','月份'],
  '木':['木头','树木','木工'],
  '口':['门口','人口','开口','口语']
};
function buildRelatedIndex() {
  if(RelatedWords.index)return;
  const index=new Map(),byId=new Map();
  for(const w of getAllWordsPool()){
    byId.set(w.id,w);
    if([...w.simplified].length<2)continue;
    for(const c of new Set([...w.simplified].filter(c=>/\p{Script=Han}/u.test(c)))){
      if(!index.has(c))index.set(c,new Map());
      const words=index.get(c);
      if(!words.has(w.simplified))words.set(w.simplified,{text:w.simplified,entries:[]});
      words.get(w.simplified).entries.push(w);
    }
  }
  RelatedWords.index=index;RelatedWords.byId=byId;
}
function relatedLevel(level){return level==='7_9'?7:Number(level)||99;}
function relatedGroups(char,context='all'){
  buildRelatedIndex();
  const groups=[...(RelatedWords.index.get(char)?.values()||[])],priority=RELATED_PRIORITY[char]||[];
  const level=relatedLevel(context),min=g=>Math.min(...g.entries.map(w=>relatedLevel(w.level)));
  const rank=g=>{const i=priority.indexOf(g.text);return i<0?999:i;};
  return groups.sort((a,b)=>Number(min(a)>level)-Number(min(b)>level)
    ||(min(a)>level&&min(b)>level?min(a)-min(b):0)
    ||rank(a)-rank(b)||min(a)-min(b)||[...a.text].length-[...b.text].length);
}
function relatedWordsPreview(char,context='all',exclude=''){
  if([...char].length!==1||!/\p{Script=Han}/u.test(char))return '';
  const groups=relatedGroups(char,context).filter(g=>g.text!==exclude);
  if(!groups.length)return `<p class="related-empty">Энэ үгийн санд ${char} орсон өөр нийлмэл үг алга.</p>`;
  const first=groups.slice(0,3);
  return `<section class="related-preview" aria-label="${char} ханз орсон үгс"><h4>${char} орсон үгс</h4><ul>${first.map(g=>`<li><strong lang="zh">${escapeHtml(g.text)}<small>${escapeHtml(g.entries[0].pinyin)} · HSK ${String(g.entries[0].level).replace('_','–')}</small></strong><span>${escapeHtml(g.entries[0].mongolian)}</span></li>`).join('')}</ul><div class="related-preview-actions"><button class="btn-small" onclick="openRelatedWords('${char}','${context}','list','${encodeURIComponent(exclude)}')">${groups.length>3?'Бусад '+(groups.length-3)+' үгийг харах':'Дэлгэрэнгүй харах'} · ${groups.length}</button><button class="btn-small" onclick="openRelatedWords('${char}','${context}','map','${encodeURIComponent(exclude)}')">Модоор үзэх</button></div></section>`;
}
function relatedWordsForEntry(text,context='all'){
  const chars=[...new Set([...text].filter(c=>/\p{Script=Han}/u.test(c)))];
  if(!chars.length)return '';
  if(chars.length===1&&[...text].length===1)return relatedWordsPreview(chars[0],context);
  return `<details class="related-character-links"><summary>Ханз тус бүрийн холбоотой үгс</summary><div>${chars.map(c=>relatedWordsPreview(c,context,text)).join('')}</div></details>`;
}
function relatedSearchKey(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s/g,'');}
function filteredRelatedGroups(){
  const query=relatedSearchKey(RelatedWords.query);
  return relatedGroups(RelatedWords.char,RelatedWords.context).filter(g=>g.text!==RelatedWords.exclude).map(g=>({text:g.text,entries:g.entries.filter(w=>RelatedWords.level==='all'||String(w.level)===RelatedWords.level)}))
    .filter(g=>g.entries.length&&(!query||relatedSearchKey([g.text,...g.entries.flatMap(w=>[w.pinyin,w.mongolian,w.english])].join(' ')).includes(query)));
}
function openRelatedWords(char,context='all',mode='list',exclude=''){
  if([...char].length!==1||!/\p{Script=Han}/u.test(char))return;
  try{exclude=decodeURIComponent(exclude);}catch{exclude='';}
  Object.assign(RelatedWords,{char,context:String(context),mode:mode==='map'?'map':'list',query:'',level:'all',limit:12,exclude});
  const dialog=document.getElementById('related-words-dialog');
  document.getElementById('related-words-title').textContent=char+' орсон үгс';
  document.getElementById('related-words-search').value='';
  document.getElementById('related-words-level').value='all';
  renderRelatedWords();
  if(!dialog.open){if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
}
function closeRelatedWords(){const d=document.getElementById('related-words-dialog');if(typeof d.close==='function')d.close();else d.removeAttribute('open');}
function setRelatedMode(mode){RelatedWords.mode=mode==='map'?'map':'list';renderRelatedWords();}
function filterRelatedWords(){
  RelatedWords.query=document.getElementById('related-words-search').value;
  RelatedWords.level=document.getElementById('related-words-level').value;
  RelatedWords.limit=12;renderRelatedWords();
}
function relatedWordAction(action,id){
  buildRelatedIndex();const word=RelatedWords.byId.get(id);if(!word)return;
  if(action==='listen')speakText(word.simplified);
  else if(action==='write'){closeRelatedWords();openInWriter(word.simplified,word.id,word.level);}
  else if(action==='srs'){toggleSRSWord(word.id);renderRelatedWords();}
}
function relatedWordGroup(group){
  return `<article class="related-word-row"><h3 lang="zh">${[...group.text].map(c=>c===RelatedWords.char?`<mark>${escapeHtml(c)}</mark>`:escapeHtml(c)).join('')}</h3>${group.entries.map(w=>`<div class="related-reading"><p><strong>${escapeHtml(w.pinyin)}</strong> <span class="level-tag">HSK ${String(w.level).replace('_','–')}</span></p><p>${escapeHtml(w.mongolian)}</p><p lang="en" class="related-english">${escapeHtml(w.english)}</p><div class="related-row-actions"><button class="btn-small" onclick="relatedWordAction('listen','${w.id}')">🔊 Сонсох</button><button class="btn-small" onclick="relatedWordAction('write','${w.id}')">✍ Бичих</button><button class="btn-small" onclick="relatedWordAction('srs','${w.id}')">${AppState.srsCards.some(c=>c.id===w.id)?'Картнаас хасах':'Картдаа нэмэх'}</button></div></div>`).join('')}</article>`;
}
function renderRelatedWords(){
  const groups=filteredRelatedGroups(),shown=groups.slice(0,RelatedWords.limit),total=relatedGroups(RelatedWords.char).filter(g=>g.text!==RelatedWords.exclude).length;
  const curated=typeof WORD_TREES!=='undefined'?WORD_TREES.find(t=>t.root===RelatedWords.char):null;
  document.getElementById('related-words-count').textContent=`${groups.length} / ${total} өөр үг · ${Math.min(RelatedWords.limit,groups.length)}-ийг харуулж байна`;
  document.querySelectorAll('[data-related-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.relatedMode===RelatedWords.mode);b.setAttribute('aria-pressed',String(b.dataset.relatedMode===RelatedWords.mode));});
  document.getElementById('related-curated-link').innerHTML=curated?`<button class="btn-small" onclick="openCuratedRelatedTree('${curated.id}')">4 алхамтай сургалтын мод →</button>`:'';
  document.getElementById('related-words-results').innerHTML=groups.length?
    `${RelatedWords.mode==='map'?`<div class="related-map-root" lang="zh">${RelatedWords.char}</div><div class="related-map-trunk" aria-hidden="true"></div>`:''}<div class="related-word-results ${RelatedWords.mode==='map'?'related-map':''}">${shown.map(relatedWordGroup).join('')}</div>${groups.length>shown.length?`<button class="learn-button" onclick="RelatedWords.limit+=12;renderRelatedWords()">Дараагийн ${Math.min(12,groups.length-shown.length)} үг</button>`:''}`:'<p>Энэ шүүлтэд тохирох үг алга.</p>';
}
function openCuratedRelatedTree(id){
  if(typeof WORD_TREES==='undefined'||!WORD_TREES.some(t=>t.id===id))return;
  closeRelatedWords();WordTree.id=id;WordTree.branch=null;Learn.view='word-trees';switchTab('learn');
}
