const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
function home(progress){
  const context={AppState:{grammarLessons:[{id:'g1',title:'1. Эхний',level:'HSK 1'},{id:'g2',title:'2. Дараагийн',level:'HSK 2'}]},
    learningProgress:()=>progress,dueCards:()=>[{},{}],getAllWordsPool:()=>Array(11000).fill({}),escapeHtml:s=>String(s)};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/presentation.js'),'utf8'),context);
  return vm.runInContext('var target={};renderStudyHome(target);target.innerHTML',context);
}
test('home starts at first unfinished lesson and displays actual progress and due count',()=>{
  const html=home({g1:true});
  assert.match(html,/openLesson\('g2'\)/);
  assert.match(html,/>Дараагийн<\/h2>/);
  assert.match(html,/1 \/ 2 суурь хичээлийн/);
  assert.match(html,/<strong>2<\/strong><small>Одоо давтах карт/);
  assert.match(html,/<strong>11,000<\/strong>/);
});
test('new learner gets a working first lesson action',()=>{
  const html=home({});
  assert.match(html,/openLesson\('g1'\)/);
  assert.match(html,/Эхний хичээлээ эхлэх/);
  assert.match(html,/0 \/ 2 суурь хичээлийн/);
});
