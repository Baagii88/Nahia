const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function setup(){
  const words=['1','2','3','4','5','6','7_9'].flatMap(l=>JSON.parse(fs.readFileSync(path.join(root,'data',`hsk${l}_mn.json`))));
  const elements=new Map(),actions=[];
  function el(id){if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',value:'all',open:false,showModal(){this.open=true},close(){this.open=false},setAttribute(){}});return elements.get(id)}
  const c={window:{},AppState:{srsCards:[],currentLevel:1},getAllWordsPool:()=>words,document:{getElementById:el,querySelectorAll:()=>[]},
    escapeHtml:s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
    speakText:t=>actions.push(['listen',t]),openInWriter:(text,id,level)=>actions.push(['write',text,id,level]),
    toggleSRSWord:id=>actions.push(['srs',id])};
  vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'js/related_words.js'),'utf8'),c);
  return {run:s=>vm.runInContext(s,c),el,words,actions,c};
}
test('character index counts attested distinct compounds and preserves every reading entry',()=>{
  const {run,words}=setup();
  assert.equal(run("relatedGroups('人').length"),127);
  assert.equal(run("relatedGroups('手').length"),63);
  assert.equal(run("relatedGroups('水').length"),50);
  assert.equal(run("relatedGroups('🦄').length"),0);
  assert.equal(run('RelatedWords.index.size'),2879);
  const canonical=new Map(words.map(w=>[w.id,w]));
  for(const char of ['人','手','水','生']){
    const groups=run(`relatedGroups('${char}')`);
    assert.equal(new Set(groups.map(g=>g.text)).size,groups.length);
    for(const g of groups){assert.ok(g.text.includes(char));assert.ok([...g.text].length>1);for(const e of g.entries)assert.deepEqual(JSON.parse(JSON.stringify(e)),canonical.get(e.id));}
  }
  const shared=run("[...RelatedWords.index.values()].flatMap(m=>[...m.values()]).find(g=>g.entries.length>1)");
  assert.ok(shared&&shared.entries.length>1);
});
test('previews stay short, multi-character entries remain collapsed, recommendations consider learner level',()=>{
  const {run}=setup();
  assert.equal((run("relatedWordsPreview('手',1)").match(/<li>/g)||[]).length,3);
  assert.match(run("relatedWordsForEntry('中国',1)"),/<details/);
  assert.ok(!run("relatedWordsForEntry('中国',1)").includes('<details open'));
  assert.equal((run("relatedWordsForEntry('你好',1)").match(/class="related-preview"/g)||[]).length,2);
  assert.ok(!run("relatedWordsPreview('你',1,'你好')").includes('<strong lang="zh">你好<'));
  assert.match(run("relatedWordsPreview('龘',1)"),/өөр нийлмэл үг алга/);
  assert.equal(run("relatedWordsForEntry('ABC')"),'');
  assert.ok(run("(()=>{const g=relatedGroups('手',1),n=g.filter(g=>g.entries.some(e=>Number(e.level)<=1)).length;return n>0&&g.slice(0,Math.min(3,n)).every(g=>g.entries.some(e=>Number(e.level)<=1));})()"));
});
test('current compound is omitted when showing other words sharing one of its characters',()=>{
  const {run,el}=setup();run("openRelatedWords('手','all','list',encodeURIComponent('手机'))");
  assert.equal(run("filteredRelatedGroups().some(g=>g.text==='手机')"),false);
  assert.match(el('related-words-count').textContent,/62 \/ 62/);
});
test('modal filters all levels and supports toneless pinyin, pagination, multiple readings and map display',()=>{
  const {run,el}=setup();run("openRelatedWords('水','1','list')");
  assert.equal(el('related-words-dialog').open,true);
  assert.equal((el('related-words-results').innerHTML.match(/class="related-word-row"/g)||[]).length,12);
  run("RelatedWords.query='shui guo';renderRelatedWords()");
  assert.equal(run("filteredRelatedGroups().map(g=>g.text).join(',')"),'水果');
  assert.match(el('related-words-results').innerHTML,/<mark>水<\/mark>果/);
  run("RelatedWords.query='';RelatedWords.level='1';renderRelatedWords()");
  assert.ok(run("filteredRelatedGroups().every(g=>g.entries.every(e=>String(e.level)==='1'))"));
  run("RelatedWords.level='all';RelatedWords.limit=24;setRelatedMode('map')");
  assert.equal((el('related-words-results').innerHTML.match(/class="related-word-row"/g)||[]).length,24);
  assert.match(el('related-words-results').innerHTML,/related-map-root/);
  run("RelatedWords.query='<script>';renderRelatedWords()");assert.match(el('related-words-results').innerHTML,/тохирох үг алга/);
});
test('row actions resolve canonical IDs, preserve vocabulary filter, and writing closes the modal',()=>{
  const {run,words,el,actions,c}=setup();const word=words.find(w=>w.simplified==='手机');
  run("openRelatedWords('手')");
  run(`relatedWordAction('listen','${word.id}');relatedWordAction('srs','${word.id}');relatedWordAction('write','${word.id}')`);
  assert.deepEqual(actions,[['listen','手机'],['srs',word.id],['write','手机',word.id,word.level]]);
  assert.equal(el('related-words-dialog').open,false);assert.equal(c.AppState.currentLevel,1);
  run("relatedWordAction('write','not-a-real-id')");assert.equal(actions.length,3);
});
