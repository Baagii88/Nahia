const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
function setup() {
  const elements = new Map(), saved = new Map();
  const element = id => {
    if(!elements.has(id)) elements.set(id,{innerHTML:'',textContent:'',value:'all',checked:true,style:{},classList:{add(){},remove(){},toggle(){}},querySelector(){return null},setAttribute(){}});
    return elements.get(id);
  };
  const context={window:{addEventListener(){},scrollTo(){}},document:{getElementById:element,querySelectorAll(){return[]},addEventListener(){}},console,
    storageGet:k=>saved.get(k),storageSet:(k,v)=>saved.set(k,v),escapeHtml:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    formatMarkdown:s=>s,
    AppState:{grammarLessons:JSON.parse(fs.readFileSync(path.join(root,'data/grammar_mn.json'))),strokesData:{},srsCards:[]},
    getAllWordsPool:()=>[]};
  vm.createContext(context);
  for(const file of ['radical_data.js','picture_data.js','learning.js']) vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),context);
  return {run:code=>vm.runInContext(code,context),element,saved};
}
test('picture deck preserves all 250 source pages with reviewed labels and existing assets',()=>{
  const {run}=setup();
  const cards=run('window.PICTURE_CARDS');
  assert.equal(cards.length,250);
  assert.equal(new Set(cards.map(c=>c.id)).size,250);
  assert.equal(new Set(cards.map(c=>c.source+':'+c.page)).size,250);
  for(const c of cards){
    assert.match(c.hanzi,/^\p{Script=Han}$/u);
    assert.ok(c.pinyin && c.mongolian && c.english);
    assert.ok(c.page>=1&&c.page<=50);
    assert.ok(fs.existsSync(path.join(root,c.image)));
    assert.ok(fs.existsSync(path.join(root,c.front)));
  }
  assert.equal(cards[167].pinyin,'fà');
  assert.equal(cards[215].pinyin,'pù');
});
test('radical index contains 214 unique Kangxi numbers and searchable water variant',()=>{
  const {run}=setup(); const radicals=run('window.RADICALS');
  assert.equal(radicals.length,214);
  assert.equal(new Set(radicals.map(r=>r.number)).size,214);
  for(const r of radicals) assert.ok(r.mn&&r.pinyin&&r.strokes>=1&&r.strokes<=17);
  const water=radicals.find(r=>r.char==='水');
  assert.ok(water.variants.includes('氵'));
  assert.equal(water.mn,'ус');
});
test('all 17 lessons have answer explanations and a second ordering exercise; wrong answers do not pass',()=>{
  const {run,saved}=setup();
  assert.equal(run('Object.keys(LESSON_PRACTICE).length'),17);
  for(let i=1;i<=17;i++){
    const id='g'+i;
    run(`openLesson('${id}')`);
    assert.ok(run(`LESSON_PRACTICE.${id}[4].length>20`));
    run(`answerLesson(0,(LESSON_PRACTICE.${id}[3]+1)%3)`);
    run(`LESSON_PRACTICE.${id}[7].split('|').forEach((_,i)=>orderLesson(i))`);
    assert.ok(!JSON.parse(saved.get('mongol_hsk_learning')||'{}')[id]);
    run(`answerLesson(0,LESSON_PRACTICE.${id}[3])`);
    assert.equal(JSON.parse(saved.get('mongol_hsk_learning'))[id],true);
  }
});
test('worksheet ignores non-Hanzi and HTML, deduplicates, limits to twelve, supports trace and memory',()=>{
  const {run,element}=setup();
  assert.equal(run("worksheetCharacters('<script>人 人山 abc</script>').join('')"),'人山');
  assert.equal(run("worksheetCharacters('一二三四五六七八九十百千万').length"),12);
  element('worksheet-text').value='人山'; element('worksheet-mode').value='memory';
  run('previewWorksheet()');
  const memory=element('worksheet-preview').innerHTML;
  assert.equal((memory.match(/class="writing-cell /g)||[]).length,16);
  assert.equal((memory.match(/class="writing-cell trace"/g)||[]).length,0);
  element('worksheet-mode').value='mixed'; run('previewWorksheet()');
  assert.equal((element('worksheet-preview').innerHTML.match(/class="writing-cell trace"/g)||[]).length,4);
});
test('malformed learning progress is ignored and unrelated object keys are discarded',()=>{
  const {run,saved}=setup(); saved.set('mongol_hsk_learning','{');
  assert.equal(run('Object.keys(learningProgress()).length'),0);
  saved.set('mongol_hsk_learning','{"g1":true,"g2":"yes","unexpected":true,"picture-250":false}');
  assert.equal(run('JSON.stringify(learningProgress())'),'{"g1":true,"picture-250":false}');
});
