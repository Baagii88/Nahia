const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function setup(){
  const elements=new Map(),storage=new Map();
  const el=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',value:'all'});return elements.get(id)};
  const context={window:{addEventListener(){},scrollTo(){}},document:{getElementById:el},console,
    storageGet:k=>storage.get(k),storageSet:(k,v)=>storage.set(k,v),
    escapeHtml:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),
    AppState:{strokesData:JSON.parse(fs.readFileSync(path.join(root,'data/hsk_strokes.json'))),srsCards:[]},
    openInWriter:(word,id,level)=>{context.lastWriter={word,id,level}},getAllWordsPool:()=>[],formatMarkdown:s=>s};
  vm.createContext(context);
  for(const name of ['radical_data.js','picture_data.js','learning.js','radical_lessons_data.js','radical_lessons.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),context);
  return{run:code=>vm.runInContext(code,context),el,storage,context};
}
test('all 214 radical lessons contain translated verified examples with complete stroke geometry',()=>{
  const {run}=setup(),data=run('window.RADICAL_LESSONS'),radicals=run('window.RADICALS');
  const dictionary=new Map(fs.readFileSync(path.join(root,'data/radical_dictionary.jsonl'),'utf8').trim().split('\n').map(line=>{const r=JSON.parse(line);return[r.character,r]}));
  const strokes=run('AppState.strokesData');Object.assign(strokes,data.strokes);
  assert.equal(data.lessons.length,214);assert.equal(new Set(data.lessons.map(l=>l.number)).size,214);
  assert.equal(data.order.length,30);
  let count=0;
  for(const lesson of data.lessons){
    const r=radicals.find(r=>r.number===lesson.number);
    assert.ok(lesson.examples.length>0);assert.ok(strokes[r.char]);
    for(const e of lesson.examples){
      count++;assert.ok(e.mn&&e.en&&e.pinyin,e.char);assert.notEqual(e.review,'pending');
      assert.ok(strokes[e.char],e.char);assert.ok(e.highlight.length,e.char);
      assert.ok(e.highlight.every(i=>Number.isInteger(i)&&i>=0&&i<strokes[e.char].strokes.length),e.char);
      if(e.role!=='self')assert.equal(dictionary.get(e.char).matches.length,strokes[e.char].strokes.length,e.char+' source stroke alignment');
      assert.ok(['self','left','right','top','bottom','inside'].includes(e.position));
    }
  }
  assert.equal(count,701);
});
test('right and left 阝 and flesh/moon remain distinct lessons',()=>{
  const {run}=setup();
  assert.ok(run("radicalLesson(163).examples.every(e=>e.part!=='阝'||e.position==='right')"));
  assert.ok(run("radicalLesson(170).examples.every(e=>e.part!=='阝'||e.position==='left')"));
  assert.equal(run("radicalLesson(130).examples.find(e=>e.char==='肚').part"),'⺼');
  assert.equal(run("radicalLesson(74).examples.find(e=>e.char==='明').part"),'月');
  assert.equal(run("radicalLesson(15).examples.find(e=>e.char==='准').mn"),'зөвшөөрөх; оновчтой; стандарт');
});
test('all 428 quiz questions have exactly one correct choice and distinct visible labels',()=>{
  const {run}=setup();
  for(let id=1;id<=214;id++)for(const q of run(`radicalExercises(${id})`)){
    assert.equal(q.options.filter(o=>o.id===q.correct).length,1,'radical '+id);
    assert.equal(new Set(q.options.map(o=>o.label)).size,q.options.length,'radical '+id);
    assert.ok(q.explanation.length>20);
  }
});
test('every radical detail renders with two exercises and no missing labels, including comparison panels',()=>{
  const {run,el}=setup();
  for(let id=1;id<=214;id++){
    run(`openRadical(${id})`);
    const html=el('learning-content').innerHTML;
    assert.equal((html.match(/<fieldset /g)||[]).length,2,'radical '+id);
    assert.ok(!html.includes('undefined')&&!html.includes('NaN'),'radical '+id);
    assert.match(html,/radical-selected-stroke/);
  }
});
test('incorrect or partial radical answers cannot save mastery; completion survives reopen and can be reset',()=>{
  const {run,storage}=setup();
  run('openRadical(15);answerRadical(0,85);answerRadical(1,1)');
  assert.ok(!JSON.parse(storage.get('mongol_hsk_learning')||'{}')['radical-15']);
  run('answerRadical(0,15)');
  assert.equal(JSON.parse(storage.get('mongol_hsk_learning'))['radical-15'],true);
  run('openRadical(15)');assert.equal(run("learningProgress()['radical-15']"),true);
  run('resetRadical(15)');assert.equal(run("learningProgress()['radical-15']"),false);
});
test('search includes all 214 even in starter mode and navigation follows the starter order',()=>{
  const {run,el}=setup();
  run("RadicalStudy.group='start';filterRadicals('龠')");
  assert.match(el('radical-result-count').textContent,/1 радикал/);
  assert.match(el('radical-results').innerHTML,/openRadical\(214\)/);
  run('openRadical(9);moveRadical(1)');assert.equal(run('RadicalStudy.id'),30);
  run('openRadical(214)');assert.equal(run('RadicalStudy.group'),'all');
  run('moveRadical(1)');assert.equal(run('RadicalStudy.id'),1);
});
test('colored SVG marks exactly the verified strokes and color can be hidden; rare writing adds local geometry',()=>{
  const {run,context}=setup();
  const colored=run("radicalGlyph('冷',[0,1],true)");
  assert.equal((colored.match(/class="radical-selected-stroke"/g)||[]).length,2);
  assert.ok(!run("radicalGlyph('冷',[0,1],false)").includes('class="radical-selected-stroke"'));
  run("radicalWrite('鬃')");assert.ok(run("AppState.strokesData['鬃'].strokes.length>0"));
  assert.equal(context.lastWriter.word,'鬃');assert.equal(context.lastWriter.level,'all');
});
