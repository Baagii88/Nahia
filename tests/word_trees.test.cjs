const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function setup(){
  const elements=new Map(),actions=[];
  const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:''});return elements.get(id)};
  const words=['1','2','3','4','5','6','7_9'].flatMap(l=>JSON.parse(fs.readFileSync(path.join(root,'data',`hsk${l}_mn.json`))));
  const c={window:{scrollTo(){},addEventListener(){}},document:{getElementById:element},AppState:{srsCards:[]},getAllWordsPool:()=>words,
    escapeHtml:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),storageGet:()=>null,storageSet(){},
    speakText:t=>actions.push(['listen',t]),openInWriter:(t,id,level)=>actions.push(['write',t,level]),toggleSRSWord:id=>actions.push(['srs',id])};
  vm.createContext(c);
  for(const f of ['learning.js','word_trees.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),c);
  vm.runInContext("Learn.view='word-trees'",c);
  return{run:code=>vm.runInContext(code,c),element,actions};
}
test('seven curated trees have real shared-character edges and complete bilingual glosses',()=>{
  const {run}=setup(),trees=run('WORD_TREES'),glosses=run('WORD_TREE_GLOSSES');
  assert.equal(trees.length,7);assert.equal(new Set(glosses.map(w=>w.text)).size,glosses.length);
  const lookup=new Map(glosses.map(w=>[w.text,w]));
  for(const t of trees){
    assert.equal(t.branches.length,3);
    for(const [word,bridge,children,note] of t.branches){
      assert.ok(word.includes(t.root));assert.ok(word.includes(bridge));assert.equal(children.length,3);assert.ok(note);
      for(const text of [t.root,word,bridge,...children]){
        const g=lookup.get(text);assert.ok(g?.pinyin&&g.mn&&g.en,text);
      }
      assert.ok(children.every(w=>w.includes(bridge)));
    }
  }
  assert.equal(trees[0].branches[0][0],'人们');
  assert.equal(trees[0].branches[0][2].join(','),'我们,你们,他们');
  assert.equal(trees[0].branches[1][2].join(','),'男生,男孩儿,男朋友');
  assert.equal(trees[0].branches[2][2].join(','),'女生,女儿,女朋友');
});
test('only one branch is expanded; switching roots resets it; initial hint is visible',()=>{
  const {run,element}=setup();run("learnView('word-trees')");
  assert.match(element('learning-content').innerHTML,/Дээрх гурван үгийн аль нэгийг сонгоорой/);
  assert.ok(!element('learning-content').innerHTML.includes('id="word-tree-detail" hidden'));
  run('toggleWordBranch(1)');assert.equal(run('WordTree.branch'),1);
  assert.equal((element('learning-content').innerHTML.match(/aria-expanded="true"/g)||[]).length,1);
  assert.match(element('learning-content').innerHTML,/男朋友/);
  run('toggleWordBranch(2)');assert.equal(run('WordTree.branch'),2);
  assert.equal((element('learning-content').innerHTML.match(/aria-expanded="true"/g)||[]).length,1);
  run('toggleWordBranch(2)');assert.equal(run('WordTree.branch'),null);
  run("toggleWordBranch(0);chooseWordTree('water')");assert.equal(run('WordTree.branch'),null);
});
test('every branch renders without missing labels; shared characters are emphasized',()=>{
  const {run,element}=setup();
  for(const t of run('WORD_TREES'))for(let i=0;i<3;i++){
    run(`chooseWordTree('${t.id}');WordTree.branch=${i};renderLearn()`);
    const html=element('learning-content').innerHTML;
    assert.ok(!html.includes('undefined'));assert.equal((html.match(/class="word-tree-card stage-4"/g)||[]).length,3);
    assert.match(html,/word-tree-shared/);
  }
});
test('audio and writing use the selected word; canonical matches require the exact reading and supplemental cards are available',()=>{
  const {run,actions}=setup();
  const index=run("WORD_TREE_GLOSSES.findIndex(w=>w.text==='我们')");
  run(`treeAction('listen',${index});treeAction('write',${index});treeAction('srs',${index})`);
  assert.deepEqual(actions[0],['listen','我们']);assert.deepEqual(actions[1],['write','我们','all']);
  assert.equal(actions[2][0],'srs');
  assert.ok(run("treeCanonical('我们').id"));
  assert.equal(run("treeReadingKey(\"nǚ ' ér\")"),"nǚér");
  assert.notEqual(run("treeReadingKey('fā')"),run("treeReadingKey('fà')"));
  assert.ok(run("treeCardWord('记住').id"));
});
