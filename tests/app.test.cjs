const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

function setup(saved) {
  const elements = new Map(), timers = new Map(), storage = new Map();
  if (saved !== undefined) storage.set('mongol_hsk_srs', saved);
  let timerId = 0, options, quizOptions, hints = [];
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      innerHTML: '', textContent: '', hidden: false, style: {}, dataset: {}, clientWidth: 296,
      classList: { add() {}, toggle() {} }, setAttribute() {}, addEventListener() {},
      querySelector() { return { textContent: '' }; }
    });
    return elements.get(id);
  };
  const context = {
    console, navigator: {}, location: { protocol: 'file:' },
    window: { innerWidth: 320, devicePixelRatio: 1, scrollTo() {}, addEventListener() {} },
    document: { addEventListener() {}, getElementById: element, querySelector: element, querySelectorAll() { return []; } },
    localStorage: { getItem(key) { return storage.get(key) ?? null; }, setItem(key, value) { storage.set(key, value); } },
    alert() {}, setTimeout(fn) { const id = ++timerId; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); }, setInterval() {},
    HanziWriter: { create(id, char, opts) {
      options = opts;
      return { cancelQuiz() {}, showOutline() {}, hideOutline() {}, animateCharacter() {},
        highlightStroke(n) { hints.push(n); }, quiz(opts) { quizOptions = opts; } };
    } }
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'js/data_bundle.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'js/app.js'), 'utf8'), context);
  const run = code => vm.runInContext(code, context);
  run('loadData();loadSRSData()');
  return { run, element, timers, storage, context, options: () => options, quiz: () => quizOptions, hints };
}

test('ratings schedule actual future dates with matching initial intervals', () => {
  const { run } = setup();
  for (const [grade, days] of [[1, 1 / 1440], [2, 1], [3, 3], [4, 7]]) {
    const result = run(`nextSchedule({interval:0,reps:0,ease:2.5},${grade},0)`);
    assert.equal(result.interval, days);
    assert.equal(Date.parse(result.dueDate), days * 86400000);
  }
  run('AppState.srsCards.forEach(c=>c.dueDate="2099-01-01T00:00:00Z");renderFlashcard()');
  assert.equal(run('dueCards().length'), 0);
  assert.equal(run('AppState.activeCardId'), null);
});

test('empty deck remains empty on reload and can be repopulated and rated', () => {
  const { run, storage } = setup('[]');
  assert.equal(run('AppState.srsCards.length'), 0);
  run('renderFlashcard();toggleSRSWord("hsk1_1");renderFlashcard();flipFlashcard();rateCard(4)');
  assert.equal(run('AppState.srsCards.length'), 1);
  assert.equal(run('dueCards().length'), 0);
  assert.equal(JSON.parse(storage.get('mongol_hsk_srs'))[0].interval, 7);
});

test('invalid storage is handled and stale translations are replaced by current dictionary entries', () => {
  for (const saved of ['null', '{}', 'not-json']) assert.equal(setup(saved).run('AppState.srsCards.length'), 0);
  const { run } = setup();
  const cards = run('normalizeCards([{id:"hsk1_1",mongolian:"stale",interval:-20,ease:50,reps:-2,dueDate:"broken"},{id:"unknown"},{id:"hsk1_1"}])');
  assert.equal(cards.length, 1);
  assert.notEqual(cards[0].mongolian, 'stale');
  assert.equal(cards[0].interval, 0);
  assert.equal(cards[0].ease, 3);
  assert.ok(Number.isFinite(Date.parse(cards[0].dueDate)));
});

test('new quiz cancels old timers and double answers cannot increase the score', () => {
  const { run, timers } = setup();
  run('startQuizMode("hanzi_to_mn");checkQuizAnswer(AppState.quizQuestions[0].word.id,{classList:{add(){}}})');
  assert.equal(timers.size, 1);
  run('checkQuizAnswer(AppState.quizQuestions[0].word.id,{classList:{add(){}}})');
  assert.equal(run('AppState.quizScore'), 1);
  run('startQuizMode("mn_to_hanzi")');
  assert.equal(timers.size, 0);
  assert.equal(run('AppState.quizIndex'), 0);
});

test('quiz hides pronunciation and uses unique visible option labels', () => {
  const { run, element } = setup();
  run('startQuizMode("hanzi_to_mn")');
  const html = element('quiz-view').innerHTML;
  // A short reading such as "a" can legitimately occur inside HTML attributes.
  // Check the visible question itself, rather than searching the entire markup.
  const question = html.match(/class="quiz-main-word"[^>]*>([\s\S]*?)<\/div>/)[1].trim();
  assert.equal(question, run('AppState.quizQuestions[0].word.simplified'));
  assert.equal(run('AppState.quizQuestions.every(q=>q.word.mongolian && new Set(q.options.map(w=>w.mongolian)).size===q.options.length)'), true);
  assert.equal(run('AppState.quizQuestions.every(q=>q.options.filter(w=>w.simplified===q.word.simplified).length===1)'), true);
  assert.ok(!html.includes('pinyin-tone'));
});

test('writer keeps word context separate from exact character readings', () => {
  const { run, element } = setup();
  run('setWriterCharacter("中国", "国")');
  assert.equal(run('AppState.currentChar'), '国');
  assert.notEqual(element('writer-pinyin').textContent, 'Zhōng guó');
  assert.match(element('writer-word-context').textContent, /中国/);
  assert.match(element('writer-char-picker').innerHTML, /国/);
  run('setWriterCharacter("abc")');
  assert.equal(run('AppState.currentChar'), '国');
});

test('lesson writing can use every character without changing the vocabulary filter', () => {
  const { run } = setup();
  run("setLevel(2);openInWriter('人山水',null,'all')");
  assert.equal(run('AppState.currentLevel'), 2);
  assert.equal(run('AppState.writerLevel'), 'all');
  assert.equal(run('AppState.writerWord'), '人山水');
});

test('reviewed supplemental tree cards survive SRS reload and backup normalization without expanding HSK vocabulary', () => {
  const { run, context, storage } = setup();
  vm.runInContext(fs.readFileSync(path.join(root, 'js/word_trees.js'), 'utf8'), context);
  const before=run('getAllWordsPool().length');
  run("const extraTreeWord=window.MONGOL_HSK_SUPPLEMENTAL.find(w=>w.simplified==='记住');toggleSRSWord(extraTreeWord.id)");
  assert.ok(run("AppState.srsCards.some(w=>w.id===extraTreeWord.id)"));
  run('loadSRSData()');
  assert.equal(run("AppState.srsCards.find(w=>w.id===extraTreeWord.id).mongolian"),'санаандаа тогтоох');
  assert.equal(run('getAllWordsPool().length'),before);
  assert.equal(run("normalizeCards([{id:extraTreeWord.id,mongolian:'буруу'}])[0].mongolian"),'санаандаа тогтоох');
  assert.equal(run("normalizeCards([{id:'unknown_extra'}]).length"),0);
  assert.ok(storage.get('mongol_hsk_srs').includes('word_tree_'));
});

test('memory mode suppresses outlines and automatic hints; guided mode animates the next stroke', () => {
  const app = setup();
  app.run('setWriterMode("memory");startQuiz()');
  assert.equal(app.options().showOutline, false);
  assert.equal(app.options().showCharacter, false);
  assert.equal(app.quiz().showHintAfterMisses, false);
  assert.equal(app.hints.length, 0);
  app.run('setWriterMode("guided");startQuiz()');
  assert.equal(app.options().showOutline, true);
  assert.deepEqual(app.hints, [0]);
  app.quiz().onCorrectStroke({ strokeNum: 0, strokesRemaining: 3 });
  assert.deepEqual(app.hints, [0, 1]);
});

test('writer navigates words in place, preserves mode, and searches within its level', () => {
  const { run, element } = setup();
  run('setWriterLevel("1");setWriterMode("memory")');
  const first = run('AppState.writerSelectedId');
  assert.equal(element('writer-prev-word').disabled, true);
  run('moveWriterWord(1)');
  assert.notEqual(run('AppState.writerSelectedId'), first);
  assert.equal(run('AppState.writerMode'), 'memory');
  run('moveWriterWord(-1)');
  assert.equal(run('AppState.writerSelectedId'), first);
  run('AppState.writerSearch="爸爸";renderWriterWordResults()');
  assert.equal(run('getWriterWords().length'), 1);
  run('selectWriterWord(getWriterWords()[0].id)');
  assert.equal(run('AppState.writerWord'), '爸爸');
  assert.equal(element('writer-word-results').hidden, true);
  run('setWriterLevel("7_9")');
  assert.equal(run('getWriterWords().length'), 5600);
  assert.equal(run('AppState.writerMode'), 'memory');
});

test('all source IDs survive, English is populated, bundle matches JSON, machine drafts never enter app data', () => {
  const { run } = setup();
  const all = run('getAllWordsPool()');
  assert.equal(all.length, 11000);
  assert.equal(new Set(all.map(w => w.id)).size, all.length);
  assert.ok(all.every(w => w.english && w.pinyin));
  assert.ok(all.every(w => w.translation_source !== 'google_machine'));
  assert.ok(all.every(w => !/\((утга|тайлбар):/.test(w.mongolian)));
  for (const level of ['1', '2', '3', '4', '5', '6', '7_9']) {
    const json = JSON.parse(fs.readFileSync(path.join(root, `data/hsk${level}_mn.json`), 'utf8'));
    assert.equal(JSON.stringify(run(`window.MONGOL_HSK_DATA.hsk${level}`)), JSON.stringify(json));
    const source = JSON.parse(fs.readFileSync(path.join(root, 'data/pdf_reference.json'), 'utf8'))[level];
    assert.deepEqual(json.map(w => w.simplified), source.map(w => w.simplified));
    assert.deepEqual(json.map(w => w.pdf_pinyin), source.map(w => w.pinyin));
    if (level !== '7_9') assert.deepEqual(json.map(w => w.pdf_english || w.english), source.map(w => w.english));
  }
});

test('PDF levels 1–4 have Mongolian meanings; every old SRS ID remains resolvable', () => {
  const { run } = setup();
  for (const level of [1,2,3,4]) assert.equal(run(`window.MONGOL_HSK_DATA.hsk${level}.every(w=>w.mongolian)`), true);
  const allIds = new Set(run('[...getAllWordsPool(),...window.MONGOL_HSK_DATA.legacyWords].map(w=>w.id)'));
  const aliases = run('window.MONGOL_HSK_DATA.srsAliases');
  for (const level of ['1','2','3','4','5','6','7_9']) {
    const counts = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/legacy-level-counts.json'), 'utf8'));
    for (let index=1;index<=counts[level];index++) {
      const id=`hsk${level}_${index}`;
      assert.ok(allIds.has(id) || allIds.has(aliases[id]), `Old progress ID not preserved: ${id}`);
    }
  }
});

test('every canonical PDF entry has reviewed Mongolian and clean pronunciation', () => {
  const { run } = setup();
  const all = run('getAllWordsPool()');
  assert.equal(all.filter(w=>!w.mongolian || w.translation_source==='pending_review').length,0);
  assert.ok(all.every(w=>/[А-Яа-яӨөҮүЁё]/.test(w.mongolian)));
  assert.ok(all.every(w=>!/[\u3400-\u9fff]/.test(w.pinyin)));
  assert.match(all.find(w=>w.simplified==='好' && w.pinyin==='hào').mongolian,/дуртай/);
  assert.match(all.find(w=>w.simplified==='地' && w.pinyin==='dì').mongolian,/газар/);
  assert.match(all.find(w=>w.simplified==='喂' && w.level===5).mongolian,/хооллох/);
  assert.ok(!all.find(w=>w.simplified==='导致').english.includes('director'));
});
