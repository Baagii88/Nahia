/**
 * НАХИА - Mongolian Chinese Learning App (HSK 1 - 9 Complete Edition)
 * Comprehensive Application Controller
 */

// Application State
const AppState = {
  currentTab: 'learn',
  currentLevel: 1, // 1, 2, 3, 4, 5, 6, '7_9', 'all'
  searchQuery: '',
  words: [],
  filteredWords: [],
  displayCount: 60,
  grammarLessons: [],
  strokesData: {},
  
  // Hanzi Writer State
  currentChar: '爱',
  currentWordObj: null,
  writerInstance: null,
  isQuizzing: false,
  writerMode: 'guided',
  writerWord: '爱',
  writerGeneration: 0,
  writerLevel: 1,
  writerSearch: '',
  writerSelectedId: null,
  writerResultCount: 12,
  
  // SRS / Flashcard State
  srsCards: [],
  srsIndex: 0,
  isCardFlipped: false,
  activeCardId: null,
  
  // Quiz State
  quizType: 'hanzi_to_mn',
  quizQuestions: [],
  quizIndex: 0,
  quizScore: 0,
  quizTimer: null,
  speechTimer: null,
  quizAnswered: false,
  
  // Settings
  speechRate: 0.9,
  useToneColors: true
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  loadSRSData();
  renderCurrentTab();
});

// Load embedded or external data
function loadData() {
  if (window.MONGOL_HSK_DATA) {
    AppState.strokesData = window.MONGOL_HSK_DATA.strokes || {};
    AppState.grammarLessons = window.MONGOL_HSK_DATA.grammar || [];
    document.querySelectorAll('.level-chips .chip').forEach(chip => {
      const level = chip.dataset.level;
      const words = level === 'all' ? getAllWordsPool() : window.MONGOL_HSK_DATA[`hsk${level}`] || [];
      const label = level === 'all' ? '🌟 Бүгд' : level === '7_9' ? 'HSK 7–9' : `HSK ${level}`;
      chip.textContent = `${label} (${words.length.toLocaleString()})`;
    });
    setLevel(1);
  } else {
    document.getElementById('word-grid').textContent = 'Өгөгдөл ачаалагдсангүй. Хуудсыг дахин ачаална уу.';
  }
}

// Switch HSK Level (1, 2, 3, 4, 5, 6, 7-9, all)
function setLevel(lvl) {
  AppState.currentLevel = lvl;
  AppState.displayCount = 60;
  
  // Update UI chips
  document.querySelectorAll('.level-chips .chip').forEach(chip => {
    const chipLvl = chip.dataset.level;
    const isActive = (chipLvl === String(lvl)) || (lvl === '7_9' && chipLvl === '7_9');
    chip.classList.toggle('active', isActive);
  });
  
  if (window.MONGOL_HSK_DATA) {
    if (lvl === 'all') {
      AppState.words = [
        ...(window.MONGOL_HSK_DATA.hsk1 || []),
        ...(window.MONGOL_HSK_DATA.hsk2 || []),
        ...(window.MONGOL_HSK_DATA.hsk3 || []),
        ...(window.MONGOL_HSK_DATA.hsk4 || []),
        ...(window.MONGOL_HSK_DATA.hsk5 || []),
        ...(window.MONGOL_HSK_DATA.hsk6 || []),
        ...(window.MONGOL_HSK_DATA.hsk7_9 || [])
      ];
    } else {
      const key = `hsk${lvl}`;
      AppState.words = window.MONGOL_HSK_DATA[key] || [];
    }
  }
  
  filterWords();
  updateStats();
}

// Utility to strip tones for fuzzy Pinyin searching
function stripTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[1-5]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
}

// Filter words based on level & search query
function filterWords() {
  const qRaw = AppState.searchQuery.trim();
  const q = qRaw.toLowerCase();
  const qClean = stripTones(qRaw);
  
  if (!q) {
    AppState.filteredWords = AppState.words;
  } else {
    // Respect the selected level. Select “Бүгд” to search every level.
    const pool = AppState.words;
    
    AppState.filteredWords = pool.filter(w => {
      const matchSimplified = w.simplified && w.simplified.includes(qRaw);
      const matchTraditional = w.traditional && w.traditional.includes(qRaw);
      const matchMongolian = w.mongolian && w.mongolian.toLowerCase().includes(q);
      const matchEnglish = w.english && w.english.toLowerCase().includes(q);
      
      // Exact or direct Pinyin match
      const matchPinyinDirect = (w.pinyin && w.pinyin.toLowerCase().includes(q)) ||
                                (w.pinyin_num && w.pinyin_num.toLowerCase().includes(q));
                                
      // Fuzzy Pinyin match (e.g. typing "nihao" finds "nǐ hǎo" [ni3 hao3])
      const matchPinyinFuzzy = qClean && (stripTones(w.pinyin).includes(qClean) || stripTones(w.pinyin_num).includes(qClean));
      
      return matchSimplified || matchTraditional || matchMongolian || matchEnglish || matchPinyinDirect || matchPinyinFuzzy;
    });
  }
  
  renderWordList();
}

function getAllWordsPool() {
  if (!window.MONGOL_HSK_DATA) return AppState.words;
  return [
    ...(window.MONGOL_HSK_DATA.hsk1 || []),
    ...(window.MONGOL_HSK_DATA.hsk2 || []),
    ...(window.MONGOL_HSK_DATA.hsk3 || []),
    ...(window.MONGOL_HSK_DATA.hsk4 || []),
    ...(window.MONGOL_HSK_DATA.hsk5 || []),
    ...(window.MONGOL_HSK_DATA.hsk6 || []),
    ...(window.MONGOL_HSK_DATA.hsk7_9 || [])
  ];
}

// Format Pinyin with Tone Colors (1: Red, 2: Orange, 3: Green, 4: Blue, 5: Gray)
function formatPinyinWithToneColors(pinyinStr) {
  if (!pinyinStr) return '';
  const toneMap = {
    'ā': 1, 'á': 2, 'ǎ': 3, 'à': 4,
    'ē': 1, 'é': 2, 'ě': 3, 'è': 4,
    'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4,
    'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4,
    'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4,
    'ǖ': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4,
    'Ā': 1, 'Á': 2, 'Ǎ': 3, 'À': 4,
    'Ē': 1, 'É': 2, 'Ě': 3, 'È': 4,
    'Ī': 1, 'Í': 2, 'Ǐ': 3, 'Ì': 4,
    'Ō': 1, 'Ó': 2, 'Ǒ': 3, 'Ò': 4,
    'Ū': 1, 'Ú': 2, 'Ǔ': 3, 'Ù': 4,
    'Ǖ': 1, 'Ǘ': 2, 'Ǚ': 3, 'Ǜ': 4,
    'ń': 2, 'ň': 3, 'ǹ': 4, 'ḿ': 2
  };
  
  const syllables = pinyinStr.split(/\s+/);
  return syllables.map(syl => {
    let tone = 5;
    for (const char of syl) {
      if (toneMap[char]) {
        tone = toneMap[char];
        break;
      }
    }
    return `<span class="pinyin-tone pinyin-t${tone}">${syl}</span>`;
  }).join(' ');
}

// Render Vocabulary Grid
function renderWordList() {
  const grid = document.getElementById('word-grid');
  if (!grid) return;
  
  const words = AppState.filteredWords;
  if (words.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <h3>Үг олдсонгүй</h3>
        <p>Та өөр үгээр хайж үзнэ үү (Ханз, Pinyin, эсвэл Монгол утгаар).</p>
      </div>
    `;
    return;
  }
  
  const toDisplay = words.slice(0, AppState.displayCount);
  
  let html = toDisplay.map(w => `
    <div class="word-card" data-id="${w.id}">
      <div>
        <div class="card-top">
          <div>
            <button class="hanzi-main hanzi-button" onclick="openInWriter('${w.simplified}', '${w.id}')" title="Бичих дадлага хийх">${w.simplified}</button>
            ${w.traditional && w.traditional !== w.simplified ? `<span class="trad-badge">[${w.traditional}]</span>` : ''}
          </div>
          <span class="level-tag">HSK ${w.level}</span>
        </div>
        
        <div class="pinyin-box">${formatPinyinWithToneColors(w.pinyin || w.pinyin_num)} ${w.zhuyin ? `<small style="color:var(--text-muted);font-weight:normal">(${w.zhuyin})</small>` : ''}</div>
        <span class="pos-tag">${w.pos || 'Үг'}</span>
        
        <div class="mongol-meaning">${escapeHtml(w.mongolian || 'Монгол орчуулга хяналт хүлээж байна')}</div>${translationBadge(w)}
        <div class="english-meaning" lang="en">${escapeHtml(w.english)}</div>
        
        ${w.example && w.example !== w.simplified ? `<div class="example-box"><strong>Жишээ:</strong> ${w.example}</div>` : ''}
        ${typeof relatedWordsForEntry === 'function' ? relatedWordsForEntry(w.simplified, AppState.currentLevel) : ''}
      </div>
      
      <div class="card-actions">
        <button class="btn-small" onclick="speakText('${w.simplified}')" title="Хятад дуудлага сонсох">
          🔊 Сонсох
        </button>
        <div class="btn-group">
          <button class="btn-small" onclick="openInWriter('${w.simplified}', '${w.id}')" title="Ханз зурах/бичих">
            ✍️ Бичих
          </button>
          <button class="btn-small" onclick="toggleSRSWord('${w.id}')" title="Флашкартад нэмэх">
            ⭐ Суръя
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  if (AppState.displayCount < words.length) {
    html += `
      <div style="grid-column: 1/-1; text-align: center; margin-top: 1.5rem; margin-bottom: 2rem;">
        <button class="primary-btn" style="margin: 0 auto;" onclick="loadMoreWords()">
          Цааш үзэх (${AppState.displayCount} / ${words.length} үг) ⬇
        </button>
      </div>
    `;
  }
  
  grid.innerHTML = html;
}

function loadMoreWords() {
  AppState.displayCount += 60;
  renderWordList();
}

// Update Vocabulary Statistics Banner
function updateStats() {
  const currentCount = AppState.words.length;
  const srsCount = AppState.srsCards.length;
  
  const elLevelTotal = document.getElementById('stat-level-total');
  const elSrs = document.getElementById('stat-srs-total');
  const elAllTotal = document.getElementById('stat-all-total');
  
  if (elLevelTotal) elLevelTotal.textContent = currentCount.toLocaleString();
  if (elSrs) elSrs.textContent = srsCount.toLocaleString();
  if (elAllTotal) elAllTotal.textContent = getAllWordsPool().length.toLocaleString();
}

// Mandarin Text to Speech
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    alert('Таны хөтөч дуу хоолой дэмжихгүй байна.');
    return;
  }
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = AppState.speechRate;
  
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find(v => v.lang.startsWith('zh') || v.lang.includes('Chinese'));
  const mandarinVoice = voices.find(v => /^zh[-_](CN|TW)|^cmn/i.test(v.lang));
  if (mandarinVoice || zhVoice) {
    utterance.voice = mandarinVoice || zhVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}

// Hanzi writing: animated guidance, outline tracing, memory, and unrestricted practice.
function openInWriter(word, id, level = AppState.currentLevel) {
  AppState.writerLevel = level;
  AppState.writerSearch = '';
  document.getElementById('writer-level').value = String(AppState.writerLevel);
  document.getElementById('writer-search').value = '';
  AppState.writerSelectedId = id || null;
  switchTab('writer');
  setWriterCharacter(word);
}

function getWriterWords() {
  const data = window.MONGOL_HSK_DATA || {};
  const words = AppState.writerLevel === 'all' ? getAllWordsPool() : data[`hsk${AppState.writerLevel}`] || [];
  const query = AppState.writerSearch.trim().toLowerCase();
  const clean = stripTones(query);
  return query ? words.filter(word => [word.simplified, word.traditional, word.pinyin, word.pinyin_num, word.mongolian, word.english]
    .some(value => value && value.toLowerCase().includes(query)) ||
    (clean && stripTones(word.pinyin).includes(clean))) : words;
}

function renderWriterNavigation() {
  const words = getWriterWords();
  const index = words.findIndex(word => word.id === AppState.writerSelectedId);
  document.getElementById('writer-prev-word').disabled = index <= 0;
  document.getElementById('writer-next-word').disabled = !words.length || index === words.length - 1;
  document.getElementById('writer-word-progress').textContent = index >= 0
    ? `Үг ${index + 1} / ${words.length.toLocaleString()}` : `${words.length.toLocaleString()} үг · Ханзаа сонгоно уу`;
  const selected = words[index];
  document.getElementById('writer-selected-word').textContent = selected
    ? `${selected.simplified} · ${selected.pinyin} · ${selected.mongolian}` : AppState.writerWord;
}

function renderWriterWordResults() {
  const target = document.getElementById('writer-word-results');
  const words = getWriterWords();
  target.hidden = false;
  target.innerHTML = words.length ? words.slice(0, AppState.writerResultCount).map(word =>
    `<button class="writer-word-option ${word.id === AppState.writerSelectedId ? 'selected' : ''}" onclick="selectWriterWord('${word.id}')">
      <strong>${word.simplified}</strong><span>${escapeHtml(word.pinyin)}</span><small>${escapeHtml(word.mongolian)}</small>
    </button>`).join('') + (words.length > AppState.writerResultCount
      ? '<button class="secondary-btn" onclick="AppState.writerResultCount += 24; renderWriterWordResults()">Цааш үзэх</button>' : '')
    : '<p>Үг олдсонгүй. Өөр үг эсвэл өөр HSK түвшин сонгоно уу.</p>';
  renderWriterNavigation();
}

function selectWriterWord(id) {
  const word = getWriterWords().find(word => word.id === id);
  if (!word) return;
  AppState.writerSelectedId = id;
  setWriterCharacter(word.simplified);
  document.getElementById('writer-word-results').hidden = true;
}

function moveWriterWord(direction) {
  const words = getWriterWords();
  const index = words.findIndex(word => word.id === AppState.writerSelectedId);
  const next = index < 0 ? 0 : index + direction;
  if (next >= 0 && next < words.length) selectWriterWord(words[next].id);
}

function setWriterLevel(level) {
  AppState.writerLevel = level;
  AppState.writerSearch = '';
  AppState.writerResultCount = 12;
  document.getElementById('writer-search').value = '';
  const words = getWriterWords();
  if (words.length) selectWriterWord(words[0].id);
  else renderWriterNavigation();
}

function setWriterCharacter(word, selectedChar) {
  const characters = [...word.trim()].filter(c => /\p{Script=Han}/u.test(c));
  if (!characters.length) {
    document.getElementById('writer-status').textContent = 'Хятад ханз оруулна уу.';
    return;
  }
  AppState.writerWord = characters.join('');
  const char = selectedChar && characters.includes(selectedChar) ? selectedChar : characters[0];
  AppState.currentChar = char;
  // Never substitute a containing word's pronunciation for an individual character.
  const pool = getAllWordsPool();
  const exact = pool.filter(w => w.simplified === char);
  const wordEntry = pool.find(w => w.id === AppState.writerSelectedId && w.simplified === AppState.writerWord)
    || getWriterWords().find(w => w.simplified === AppState.writerWord);
  AppState.writerSelectedId = wordEntry ? wordEntry.id : null;
  AppState.currentWordObj = exact[0] || null;
  document.getElementById('writer-pinyin').textContent = exact.length
    ? [...new Set(exact.map(w => w.pinyin || w.pinyin_num))].join(' / ') : char;
  document.getElementById('writer-mongol').textContent = exact.some(w => w.mongolian)
    ? [...new Set(exact.map(w => w.mongolian).filter(Boolean))].join(' · ') : 'Ханз бичих дадлага';
  document.getElementById('writer-word-context').textContent = characters.length > 1 && wordEntry
    ? `Үг: ${wordEntry.simplified} · ${wordEntry.pinyin} · ${wordEntry.mongolian}` : '';
  document.getElementById('writer-char-picker').innerHTML = characters.map(c =>
    `<button class="chip ${c === char ? 'active' : ''}" onclick="setWriterCharacter(AppState.writerWord, '${c}')" aria-pressed="${c === char}">${c}</button>`).join('');
  initHanziWriter(char);
  renderWriterNavigation();
  if (typeof relatedWordsPreview === 'function') document.getElementById('writer-related-words').innerHTML = relatedWordsPreview(char, AppState.writerLevel, AppState.writerWord);
}

function getCanvasDimension() {
  const panel = document.querySelector('.canvas-panel');
  return Math.max(120, Math.min(280, (panel && panel.clientWidth ? panel.clientWidth : window.innerWidth - 24) - 32));
}

function setWriterMode(mode) {
  if (!['guided', 'trace', 'memory', 'free'].includes(mode)) return;
  AppState.writerMode = mode;
  document.querySelectorAll('[data-writer-mode]').forEach(button => {
    const active = button.dataset.writerMode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  initHanziWriter(AppState.currentChar);
}

function initHanziWriter(char) {
  const target = document.getElementById('hanzi-target');
  if (!target || typeof HanziWriter === 'undefined') return;
  if (AppState.writerInstance) AppState.writerInstance.cancelQuiz();
  AppState.writerInstance = null;
  AppState.isQuizzing = false;
  const generation = ++AppState.writerGeneration;
  target.innerHTML = '';
  const size = getCanvasDimension();
  const grid = document.querySelector('.stroke-grid-box');
  grid.style.width = `${size}px`;
  grid.style.height = `${size}px`;
  const status = document.getElementById('writer-status');
  const mode = AppState.writerMode;
  const messages = {
    guided: 'Эхлэх товчийг дарна уу. Дараагийн зураасыг хөдөлгөөнөөр үзүүлнэ.',
    trace: 'Бүдэг загварыг дагаж зураасны зөв дарааллаар бичнэ үү.',
    memory: 'Загвар болон автомат тусламжгүйгээр цээжээр бичнэ үү.',
    free: 'Чөлөөтэй бичнэ үү. Энэ горим зураасны дараалал, зөв бурууг шалгахгүй.'
  };
  status.textContent = messages[mode];
  const canvas = document.getElementById('free-writing-canvas');
  canvas.hidden = mode !== 'free';
  target.hidden = mode === 'free';
  document.getElementById('btn-writing-start').disabled = mode === 'free';
  document.getElementById('btn-writing-animate').disabled = mode === 'free';
  if (mode === 'free') {
    setupFreeCanvas(canvas, size);
    return;
  }
  AppState.writerInstance = HanziWriter.create('hanzi-target', char, {
    width: size, height: size, padding: 10,
    showCharacter: false,
    showOutline: mode !== 'memory',
    strokeAnimationSpeed: 1, delayBetweenStrokes: 150,
    // The paper is white in both themes.
    strokeColor: '#1e293b', outlineColor: '#cbd5e1', drawingColor: '#dc2626',
    drawingWidth: Math.max(10, Math.round(size * 0.055)),
    highlightColor: '#2563eb',
    charDataLoader(c, complete, fail) {
      if (AppState.strokesData[c]) complete(AppState.strokesData[c]);
      else {
        const error = new Error('Ханзын зураас дотоод санд байхгүй.');
        if (generation === AppState.writerGeneration) status.textContent = `${error.message} Чөлөөт горимд бичиж болно.`;
        fail(error);
      }
    },
    onLoadCharDataError() {
      if (generation === AppState.writerGeneration) status.textContent = 'Зураас олдсонгүй. Чөлөөт горим сонгоно уу.';
    }
  });
}

function setupFreeCanvas(canvas, size) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  canvas.style.width = canvas.style.height = `${size}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 5;
  ctx.lineCap = ctx.lineJoin = 'round';
  let drawing = false;
  const point = event => {
    const box = canvas.getBoundingClientRect();
    return [(event.clientX - box.left) * size / box.width, (event.clientY - box.top) * size / box.height];
  };
  canvas.onpointerdown = event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    drawing = true;
    const [x, y] = point(event);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y + 0.1); ctx.stroke();
  };
  canvas.onpointermove = event => {
    if (!drawing) return;
    event.preventDefault();
    ctx.lineTo(...point(event)); ctx.stroke();
  };
  canvas.onpointerup = canvas.onpointercancel = canvas.onlostpointercapture = () => { drawing = false; };
}

function animateCharacter() {
  if (!AppState.writerInstance) return;
  AppState.writerInstance.cancelQuiz();
  AppState.isQuizzing = false;
  AppState.writerInstance.showOutline();
  document.getElementById('writer-status').textContent = 'Анимейшн үзүүлж байна. Бичихдээ Эхлэх товч дарна уу.';
  AppState.writerInstance.animateCharacter();
}

function startQuiz() {
  const writer = AppState.writerInstance;
  if (!writer) return;
  const generation = AppState.writerGeneration;
  const mode = AppState.writerMode;
  const status = document.getElementById('writer-status');
  writer.cancelQuiz();
  if (mode === 'memory') writer.hideOutline(); else writer.showOutline();
  AppState.isQuizzing = true;
  status.textContent = 'Зураасыг зөв дарааллаар зурна уу...';
  writer.quiz({
    showHintAfterMisses: mode === 'memory' ? false : 2,
    highlightOnComplete: true,
    onMistake() {
      if (generation === AppState.writerGeneration) status.textContent = 'Буруу зурлаа. Дахин оролдоно уу.';
    },
    onCorrectStroke(data) {
      if (generation !== AppState.writerGeneration) return;
      status.textContent = `Зөв! ${data.strokeNum + 1} зураас бичлээ.`;
      if (mode === 'guided' && data.strokesRemaining > 0) writer.highlightStroke(data.strokeNum + 1);
    },
    onComplete() {
      if (generation !== AppState.writerGeneration) return;
      AppState.isQuizzing = false;
      status.textContent = 'Баяр хүргэе! Ханзыг амжилттай бичлээ! 🎉';
      speakText(AppState.currentChar);
    }
  });
  if (mode === 'guided') writer.highlightStroke(0);
}

function resetWriter() { initHanziWriter(AppState.currentChar); }

// Spaced Repetition (SRS Flashcards) Engine
function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch {
    document.getElementById('storage-status').textContent = 'Ахиц хадгалагдсангүй. Нөөцлөх товчоор файлаа татаж авна уу.';
    return false;
  }
}

function normalizeCards(cards) {
  if (!Array.isArray(cards)) throw new Error('Картын жагсаалт буруу байна.');
  const data = window.MONGOL_HSK_DATA || {};
  const pool = new Map([...getAllWordsPool(), ...(data.legacyWords || []), ...(window.MONGOL_HSK_SUPPLEMENTAL || [])].map(w => [w.id, w]));
  const seen = new Set();
  return cards.map(c => c && ({...c, id: (data.srsAliases || {})[c.id] || c.id}))
    .filter(c => c && pool.has(c.id) && !seen.has(c.id) && seen.add(c.id)).map(c => ({
    ...pool.get(c.id),
    interval: Number.isFinite(c.interval) ? Math.max(0, c.interval) : 0,
    reps: Number.isInteger(c.reps) ? Math.max(0, c.reps) : 0,
    ease: Number.isFinite(c.ease) ? Math.min(3, Math.max(1.3, c.ease)) : 2.5,
    dueDate: Number.isFinite(Date.parse(c.dueDate)) ? c.dueDate : new Date().toISOString()
  }));
}

function loadSRSData() {
  const saved = storageGet('mongol_hsk_srs');
  if (saved !== null) {
    try { AppState.srsCards = normalizeCards(JSON.parse(saved)); }
    catch {
      AppState.srsCards = [];
      document.getElementById('storage-status').textContent = 'Хадгалсан картын бүтэц буруу байна. Нөөц файлаас сэргээж болно.';
    }
  } else {
    AppState.srsCards = normalizeCards(AppState.words.slice(0, 15));
    saveSRSData();
  }
  updateStats();
}

function saveSRSData() {
  storageSet('mongol_hsk_srs', JSON.stringify(AppState.srsCards));
  updateStats();
}

function toggleSRSWord(id) {
  const word = [...getAllWordsPool(), ...(window.MONGOL_HSK_SUPPLEMENTAL || [])].find(w => w.id === id);
  if (!word) return;
  const index = AppState.srsCards.findIndex(c => c.id === id);
  if (index >= 0) AppState.srsCards.splice(index, 1);
  else AppState.srsCards.push(...normalizeCards([word]));
  saveSRSData();
  document.getElementById('app-status').textContent = index >= 0
    ? `${word.simplified} картыг хаслаа.` : `${word.simplified} картыг нэмлээ.`;
}

function dueCards(now = Date.now()) {
  return AppState.srsCards.filter(c => Date.parse(c.dueDate) <= now)
    .sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate));
}

function renderFlashcard() {
  const box = document.getElementById('flashcard');
  if (!box) return;
  const due = dueCards();
  const card = due[0];
  AppState.activeCardId = card ? card.id : null;
  AppState.isCardFlipped = false;
  document.getElementById('srs-buttons').style.display = 'none';
  document.getElementById('srs-progress-text').textContent = `Давтах: ${due.length} / Нийт: ${AppState.srsCards.length}`;
  if (!card) {
    const next = AppState.srsCards.map(c => Date.parse(c.dueDate)).sort((a, b) => a - b)[0];
    box.innerHTML = `<h3>${AppState.srsCards.length ? 'Одоохондоо давтах карт алга 🎉' : 'Флашкарт хоосон байна'}</h3>
      <p>${next ? `Дараагийн давталт: ${new Date(next).toLocaleString('mn-MN')}` : 'Үгийн сангаас ⭐ Суръя товчоор карт нэмнэ үү.'}</p>`;
    return;
  }
  box.innerHTML = `<div id="card-hanzi" class="flashcard-hanzi">${escapeHtml(card.simplified)}</div>
    <div id="card-hint" class="flashcard-hint">Дарж хариуг харах</div>
    <div id="card-back" class="card-back-content" style="display:none">
      <div class="flashcard-pinyin">${formatPinyinWithToneColors(card.pinyin || card.pinyin_num)}</div>
      <div class="flashcard-meaning">${escapeHtml(card.mongolian || 'Монгол орчуулга хяналт хүлээж байна')}</div>${translationBadge(card)}
      <div class="english-meaning" lang="en">${escapeHtml(card.english)}</div>
      <div class="flashcard-details">${card.example && card.example !== card.simplified ? escapeHtml(card.example) : ''}</div>
    </div>`;
  document.querySelectorAll('[data-grade]').forEach(button => {
    const days = nextSchedule(card, Number(button.dataset.grade)).interval;
    button.querySelector('.srs-time').textContent = days < 1 ? '1 минут' : `${days} хоног`;
  });
}

function flipFlashcard() {
  if (AppState.isCardFlipped || !AppState.activeCardId) return;
  AppState.isCardFlipped = true;
  document.getElementById('card-back').style.display = 'block';
  document.getElementById('srs-buttons').style.display = 'grid';
  document.getElementById('card-hint').textContent = 'Үнэлгээгээ сонгоно уу';
  speakText(AppState.srsCards.find(c => c.id === AppState.activeCardId).simplified);
}

function nextSchedule(card, grade, now = Date.now()) {
  let interval, reps = card.reps, ease = card.ease;
  if (grade === 1) { interval = 1 / 1440; reps = 0; ease = Math.max(1.3, ease - 0.2); }
  else if (grade === 2) { interval = Math.max(1, Math.round(card.interval * 1.2)); ease = Math.max(1.3, ease - 0.15); }
  else if (grade === 3) { interval = reps === 0 ? 3 : Math.max(3, Math.round(card.interval * ease)); reps++; }
  else if (grade === 4) { interval = reps === 0 ? 7 : Math.max(7, Math.round(card.interval * ease * 1.3)); ease = Math.min(3, ease + 0.15); reps++; }
  else throw new Error('Үнэлгээ буруу байна.');
  return { interval, reps, ease, dueDate: new Date(now + interval * 86400000).toISOString() };
}

function rateCard(grade) {
  const card = AppState.srsCards.find(c => c.id === AppState.activeCardId);
  if (!card || !AppState.isCardFlipped) return;
  Object.assign(card, nextSchedule(card, grade));
  saveSRSData();
  renderFlashcard();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ version: 1, cards: AppState.srsCards }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `nahia-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function importProgress(file) {
  if (!file) return;
  try {
    if (file.size > 20 * 1024 * 1024) throw new Error('Файл хэт том байна.');
    const data = JSON.parse(await file.text());
    const incoming = normalizeCards(Array.isArray(data) ? data : data.cards);
    const merged = new Map(AppState.srsCards.map(c => [c.id, c]));
    incoming.forEach(c => merged.set(c.id, c));
    AppState.srsCards = [...merged.values()];
    saveSRSData(); renderFlashcard();
    document.getElementById('storage-status').textContent = `${incoming.length} картыг нөөцөөс нэгтгэлээ.`;
  } catch (error) { document.getElementById('storage-status').textContent = `Сэргээсэнгүй: ${error.message}`; }
}

// Quiz System
function startQuizMode(type) {
  clearTimeout(AppState.quizTimer);
  clearTimeout(AppState.speechTimer);
  AppState.quizAnswered = false;
  AppState.quizType = type || 'hanzi_to_mn';
  document.querySelectorAll('[data-quiz-mode]').forEach(button => button.classList.toggle('active', button.dataset.quizMode === AppState.quizType));
  AppState.quizIndex = 0;
  AppState.quizScore = 0;
  
  // Generate 10 random questions from current level
  const words = AppState.words.filter(word => AppState.quizType === 'listening' || word.mongolian);
  const label = word => AppState.quizType === 'hanzi_to_mn' ? word.mongolian : word.simplified;
  shuffleArray(words);
  
  AppState.quizQuestions = words.slice(0, 10).map(correctWord => {
    const seen = new Set([label(correctWord)]);
    const distractors = words
      .filter(w => {
        // Another sense of the same written word would also be a valid answer.
        if (w.simplified === correctWord.simplified) return false;
        if (AppState.quizType === 'listening' && (w.pinyin_num || w.pinyin).toLowerCase().replace(/\s/g, '') ===
            (correctWord.pinyin_num || correctWord.pinyin).toLowerCase().replace(/\s/g, '')) return false;
        if (seen.has(label(w))) return false;
        seen.add(label(w));
        return true;
      })
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    const options = [correctWord, ...distractors].sort(() => 0.5 - Math.random());
    return {
      word: correctWord,
      options: options
    };
  }).filter(question => question.options.length >= 2);
  
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const container = document.getElementById('quiz-view');
  if (!container) return;
  if (AppState.quizQuestions.length === 0) {
    container.textContent = 'Энэ түвшинд монгол орчуулгатай сорил бэлтгэгдээгүй байна. Сонсголын горим эсвэл өөр түвшин сонгоно уу.';
    return;
  }
  
  if (AppState.quizIndex >= AppState.quizQuestions.length) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h2 style="font-size: 2rem; margin-bottom: 1rem;">🏆 Тест дууслаа!</h2>
        <p style="font-size: 1.25rem; margin-bottom: 1.5rem;">
          Таны оноо: <strong style="color:var(--primary); font-size:1.75rem">${AppState.quizScore}</strong> / ${AppState.quizQuestions.length}
        </p>
        <button class="primary-btn" style="margin: 0 auto;" onclick="startQuizMode('${AppState.quizType}')">
          Дахин эхлэх
        </button>
      </div>
    `;
    return;
  }
  
  AppState.quizAnswered = false;
  const q = AppState.quizQuestions[AppState.quizIndex];
  const qNum = AppState.quizIndex + 1;
  const total = AppState.quizQuestions.length;
  
  let promptHtml = '';
  let questionWord = '';
  
  if (AppState.quizType === 'hanzi_to_mn') {
    promptHtml = 'Энэ ханзны монгол утгыг сонгоно уу:';
    questionWord = q.word.simplified;
  } else if (AppState.quizType === 'mn_to_hanzi') {
    promptHtml = 'Энэ монгол утгад тохирох ханзыг сонгоно уу:';
    questionWord = q.word.mongolian;
  } else if (AppState.quizType === 'listening') {
    promptHtml = 'Дуудлагыг сонсоод тохирох ханзыг сонгоно уу:';
    questionWord = '🔊 [Дуудлага]';
    AppState.speechTimer = setTimeout(() => { if (AppState.currentTab === 'quiz') speakText(q.word.simplified); }, 200);
  }
  
  container.innerHTML = `
    <div class="quiz-progress">
      <span>Асуулт ${qNum} / ${total}</span>
      <span>Оноо: ${AppState.quizScore}</span>
    </div>
    
    <div class="quiz-question-box">
      <div class="quiz-prompt">${promptHtml}</div>
      <div class="quiz-main-word" onclick="speakText('${q.word.simplified}')" style="cursor:pointer;" title="Дуудах">
        ${questionWord}
      </div>
      <div id="quiz-feedback" aria-live="polite"></div>
    </div>
    
    <div class="quiz-options">
      ${q.options.map(opt => {
        let label = '';
        if (AppState.quizType === 'hanzi_to_mn') {
          label = `<span>${escapeHtml(opt.mongolian)}</span>`;
        } else {
          label = `<strong style="font-size:1.15rem; margin-right:0.4rem;">${opt.simplified}</strong>`;
        }
        return `
          <button class="quiz-option-btn" data-word-id="${opt.id}" onclick="checkQuizAnswer('${opt.id}', this)">
            ${label}
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function checkQuizAnswer(selectedId, btnEl) {
  const q = AppState.quizQuestions[AppState.quizIndex];
  if (!q || AppState.quizAnswered) return;
  AppState.quizAnswered = true;
  const isCorrect = selectedId === q.word.id;
  document.getElementById('quiz-feedback').textContent = `${q.word.simplified} · ${q.word.pinyin} · ${q.word.mongolian}`;
  
  document.querySelectorAll('.quiz-option-btn').forEach(b => {
    b.disabled = true;
  });
  
  if (isCorrect) {
    btnEl.classList.add('correct');
    AppState.quizScore += 1;
  } else {
    btnEl.classList.add('wrong');
    document.querySelectorAll('.quiz-option-btn').forEach(b => {
      if (b.dataset.wordId === q.word.id) {
        b.classList.add('correct');
      }
    });
  }
  
  speakText(q.word.simplified);
  
  AppState.quizTimer = setTimeout(() => {
    AppState.quizIndex += 1;
    renderQuizQuestion();
  }, 2200);
}

// Render Grammar Lessons
function renderGrammar() {
  const container = document.getElementById('grammar-container');
  if (!container) return;
  
  container.innerHTML = AppState.grammarLessons.map(lesson => `
    <div class="grammar-card">
      <div class="grammar-header" role="button" tabindex="0" aria-expanded="false" onclick="toggleGrammarBody('${lesson.id}')">
        <div>
          <span class="level-tag" style="margin-bottom:0.35rem; display:inline-block;">${lesson.level}</span>
          <h3>${lesson.title}</h3>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-top:0.25rem">${lesson.summary}</p>
        </div>
        <span id="icon-${lesson.id}">▼</span>
      </div>
      <div id="body-${lesson.id}" class="grammar-body" style="display:none;">
        ${formatMarkdown(lesson.content)}
        <button class="learn-button" onclick="openLesson('${lesson.id}');switchTab('learn')">Энэ хичээлийн дасгалыг хийх →</button>
      </div>
    </div>
  `).join('');
}

function toggleGrammarBody(id) {
  const body = document.getElementById(`body-${id}`);
  const icon = document.getElementById(`icon-${id}`);
  if (body) {
    const isHidden = body.style.display === 'none';
    body.style.display = isHidden ? 'block' : 'none';
    body.previousElementSibling.setAttribute('aria-expanded', String(isHidden));
    if (icon) icon.textContent = isHidden ? '▲' : '▼';
  }
}

// Simple Markdown formatting for grammar lessons
function formatMarkdown(md) {
  return md
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '<br><br>');
}

// Tab Switching
function switchTab(tabName) {
  if (AppState.currentTab === 'quiz' && tabName !== 'quiz') {
    clearTimeout(AppState.speechTimer);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
  AppState.currentTab = tabName;
  if(typeof updatePresentation==='function')updatePresentation(tabName);
  
  // Desktop top nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  // Mobile bottom nav
  document.querySelectorAll('.bottom-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  document.querySelectorAll('.tab-content').forEach(view => {
    view.classList.toggle('active', view.id === `tab-${tabName}`);
  });
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (tabName === 'learn') {
    renderLearn();
  } else if (tabName === 'writer') {
    if (!AppState.writerInstance) {
      setWriterCharacter(AppState.writerWord, AppState.currentChar);
    }
  } else if (tabName === 'srs') {
    renderFlashcard();
  } else if (tabName === 'quiz') {
    if (AppState.quizQuestions.length === 0) {
      startQuizMode('hanzi_to_mn');
    }
  } else if (tabName === 'grammar') {
    renderGrammar();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  const writerSearch = document.getElementById('writer-search');
  writerSearch.addEventListener('input', event => {
    AppState.writerSearch = event.target.value;
    AppState.writerResultCount = 12;
    renderWriterWordResults();
  });
  let resizeTimer;
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (AppState.currentTab === 'writer') initHanziWriter(AppState.currentChar); }, 150);
  });
  window.addEventListener('focus', () => { if (AppState.currentTab === 'srs') renderFlashcard(); });
  setInterval(() => { if (AppState.currentTab === 'srs' && !AppState.activeCardId) renderFlashcard(); }, 10000);
  document.getElementById('progress-import').addEventListener('change', event => importProgress(event.target.files[0]));
  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role=button]')) { event.preventDefault(); event.target.click(); }
  });
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value;
      AppState.displayCount = 60;
      filterWords();
    });
  }
  
  const customCharInput = document.getElementById('custom-char-input');
  const btnSetChar = document.getElementById('btn-set-char');
  if (btnSetChar && customCharInput) {
    customCharInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') btnSetChar.click();
    });
    btnSetChar.addEventListener('click', () => {
      const val = customCharInput.value.trim();
      if (val) {
        setWriterCharacter(val);
      }
    });
  }
  
  const themeToggle = document.getElementById('btn-theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', next);
      storageSet('mongol_hsk_theme', next);
      if (AppState.writerInstance) {
        initHanziWriter(AppState.currentChar);
      }
    });
    
    const savedTheme = storageGet('mongol_hsk_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
  }
}

function renderCurrentTab() {
  switchTab(AppState.currentTab);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function translationBadge(word) {
  if (word.translation_source === 'pending_review') return '<small class="translation-note">Англи эх тайлбар бүрэн байна</small>';
  return word.translation_source === 'reviewed' ? '<small class="translation-note">AI хяналттай орчуулга</small>' : '';
}

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.warn));
}
