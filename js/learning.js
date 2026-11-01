/* Learning routes, lesson exercises, radical reference, local picture deck and print sheets. */
const Learn = { view: 'home', level: 'all', lesson: null, answers: {}, order: [], picture: 0, revealed: false, pack: 'all' };
// [prompt, options, correct option index, explanation]. Written for the accompanying lessons.
const LESSON_PRACTICE = {
  g1: ['Зөв дарааллыг сонго.', 'Би ус уудаг.', ['我水喝。', '我喝水。', '水我喝。'], 1, 'Хятад хэлэнд эзэн бие 我 → үйл үг 喝 → тусагдахуун 水 гэсэн дараалалтай.', '我们学中文。', 'Бид хятад хэл сурдаг.', '我们|学|中文'],
  g2: ['他是老师___？', 'Тэр багш мөн үү?', ['吗', '的', '了'], 0, 'Тийм/үгүй асуултыг өгүүлбэрийн төгсгөлд 吗 тавьж үүсгэнэ.', '我们走吧！', 'Явцгаая!', '我们|走|吧'],
  g3: ['我___有钱。', 'Надад мөнгө байхгүй.', ['不', '没', '是'], 1, 'Байхгүй гэсэн утгад 没有 хэрэглэнэ. 不有 гэж хэлэхгүй.', '他没来。', 'Тэр ирээгүй.', '他|没|来'],
  g4: ['一___书', 'Нэг ном', ['本', '只', '条'], 0, 'Номын тоолуур үг нь 本: 一本书.', '三个人', 'Гурван хүн', '三|个|人'],
  g5: ['我___书', 'Миний ном', ['得', '地', '的'], 2, 'Эзэмшигч 我 болон нэр үг 书-г 的 холбодог.', '这是我的书。', 'Энэ миний ном.', '这|是|我|的|书'],
  g6: ['我___看书。', 'Би яг одоо ном уншиж байна.', ['在', '过', '是'], 0, '在 + үйл үг нь тухайн үед үргэлжилж буй үйлийг заана.', '我去过北京。', 'Би Бээжинд очиж үзсэн.', '我|去|过|北京'],
  g7: ['他跑___很快。', 'Тэр маш хурдан гүйдэг.', ['的', '地', '得'], 2, 'Үйл үгийн дараах гүйцэтгэлийн байдлыг 得-ээр холбоно: 跑得很快.', '她说得很好。', 'Тэр маш сайн ярьдаг.', '她|说|得|很|好'],
  g8: ['今天___昨天冷。', 'Өнөөдөр өчигдрөөс хүйтэн.', ['比', '把', '被'], 0, 'A 比 B + тэмдэг нэр: A-г B-тэй харьцуулна.', '他比我高。', 'Тэр надаас өндөр.', '他|比|我|高'],
  g9: ['请___门关上。', 'Хаалгыг хаана уу.', ['被', '把', '比'], 1, '把 нь тодорхой тусагдахуун 门-г үйл үгийн өмнө гаргаж, үр дүнг 关上 илэрхийлнэ.', '我把作业做完了。', 'Би даалгавраа хийж дуусгасан.', '我|把|作业|做完|了'],
  g10: ['我的手机___他拿走了。', 'Миний утсыг тэр аваад явсан.', ['把', '被', '比'], 1, '被-ийн өмнө үйлдэлд өртсөн зүйл, дараа нь үйлдэгч орж болно.', '门被风吹开了。', 'Хаалга салхинд онгойсон.', '门|被|风|吹开|了'],
  g11: ['___小孩子都知道。', 'Бүр жаахан хүүхэд хүртэл мэднэ.', ['连', '把', '从'], 0, '连 … 都/也 нь санаанд оромгүй тохиолдлыг онцолдог.', '他连饭都没吃。', 'Тэр бүр хоол ч идээгүй.', '他|连|饭|都|没|吃'],
  g12: ['他不仅会说汉语，___会写汉字。', 'Тэр хятадаар ярьж чаддагаас гадна ханз бичиж чадна.', ['而且', '但是', '否则'], 0, '不仅 … 而且 нь нэмэгдэж буй хоёр мэдээллийг холбоно.', '这里不仅安静，而且很干净。', 'Энэ газар нам гүмээс гадна маш цэвэрхэн.', '这里|不仅|安静|而且|很|干净'],
  g13: ['哪怕下雨，我___要去。', 'Бороо орсон ч би явна.', ['才', '也', '就'], 1, '哪怕 … 也 нь хамгийн таагүй нөхцөлд ч үр дүн өөрчлөгдөхгүйг илэрхийлнэ.', '哪怕失败，我也不放弃。', 'Бүтэлгүйтсэн ч би бууж өгөхгүй.', '哪怕|失败|我|也|不|放弃'],
  g14: ['除非你同意，___我不会去。', 'Чи зөвшөөрөхгүй бол би явахгүй.', ['而且', '否则', '虽然'], 1, '除非 нь зайлшгүй нөхцөл; 否则 нь тэр нөхцөл биелэхгүй үеийн үр дүн.', '除非下雨，否则我们去公园。', 'Бороо орохгүй бол бид цэцэрлэгт хүрээлэн явна.', '除非|下雨|否则|我们|去|公园'],
  g15: ['___目前的情况，我们决定延期。', 'Одоогийн нөхцөл байдлыг харгалзан хугацааг хойшлуулав.', ['鉴于', '哪怕', '不仅'], 0, '鉴于 нь шийдвэрийн үндэслэлийг албан найруулгаар танилцуулдаг.', '归根结底，这是教育问题。', 'Эцсийн дүндээ энэ бол боловсролын асуудал.', '归根结底|这|是|教育|问题'],
  g16: ['读者 дахь 者 ямар утгатай вэ?', 'Сонгодог хэлний ул мөр', ['уншдаг хүн', 'унших газар', 'уншсан цаг'], 0, '者 нь тухайн үйлийг хийдэг хүнийг нэрлэж болно: 读者 = уншигч.', '学者', 'Эрдэмтэн', '学|者'],
  g17: ['半途而废 ямар утгатай вэ?', 'Хэлцийн утгыг сонго.', ['ажлаа тууштай дуусгах', 'замын дундаас шантрах', 'шинэ газар очих'], 1, '半途 = замын дунд; 而废 = орхих. Эхэлсэн ажлаа дуусгалгүй орхихыг хэлнэ.', '入乡随俗', 'Очсон газрынхаа ёсыг дагах', '入|乡|随|俗']
};
function learningProgress() {
  try { const p = JSON.parse(storageGet('mongol_hsk_learning') || '{}'); return p && typeof p === 'object' && !Array.isArray(p) ? Object.fromEntries(Object.entries(p).filter(([k,v])=>/^(g\d+|picture-\d{3}|radical-\d{1,3})$/.test(k) && typeof v === 'boolean')) : {}; } catch { return {}; }
}
function saveLearning(key, value) { const p = learningProgress(); p[key] = value; storageSet('mongol_hsk_learning', JSON.stringify(p)); }
function learnView(view) { Learn.view = view; renderLearn(); window.scrollTo({top: 0, behavior: 'smooth'}); }
function learnButton(text, action) { return `<button class="learn-button" onclick="${action}">${text}</button>`; }
function renderLearn() {
  const target = document.getElementById('learning-content');
  const tabs = [['home','Эхлэх'], ['lessons','HSK хичээл'], ['basics','Авиа · Зурлага'], ['radicals','214 радикал'], ['word-trees','Үгийн мод'], ['pictures','Зурагт карт'], ['worksheets','Дасгалын хуудас']];
  document.getElementById('learning-nav').innerHTML = tabs.map(([id,name]) => `<button class="chip ${(Learn.view === id || Learn.view === 'radical-lesson' && id === 'radicals') ? 'active' : ''}" onclick="learnView('${id}')" aria-pressed="${Learn.view === id || Learn.view === 'radical-lesson' && id === 'radicals'}">${name}</button>`).join('');
  document.getElementById('tab-learn')?.classList?.toggle('is-learning-home',Learn.view==='home');
  if(typeof updatePresentation==='function')updatePresentation('learn');
  if(Learn.view==='home'&&typeof renderStudyHome==='function'){renderStudyHome(target);return;}
  if (Learn.view === 'home') {
    const done = AppState.grammarLessons.filter(l => learningProgress()[l.id]).length;
    const next = AppState.grammarLessons.find(l => !learningProgress()[l.id]) || AppState.grammarLessons[0];
    target.innerHTML = `<div class="learn-hero"><span class="level-tag">Өнөөдрийн 15 минут</span><h2>Хаанаас эхлэх вэ?</h2><p>Анхлан суралцагч бол авиа, хөгөөс эхэл. Дараа нь нэг хичээл үзэж, 5 үг сонсоод, 3 ханз бичээрэй.</p>${learnButton(done ? 'Хичээлээ үргэлжлүүлэх' : 'Эхний HSK хичээлээ эхлэх', `openLesson('${next.id}')`)}<p>${done} / ${AppState.grammarLessons.length} суурь хичээлийн дасгалыг давсан</p></div>
      <div class="learning-grid">${[
        ['1','Авиа ба дөрвөн хөг','Pinyin, сонсох жишээ, хөгийн өөрчлөлт.','basics'],
        ['2','Зурлага ба радикал','Үндсэн 8 зурлага, бичих дараалал, 214 радикал.','radicals'],
        ['3','HSK хичээл','Монгол тайлбар → жишээ → ойлгох дасгал.','lessons'],
        ['4','Үгийн холбоосын мод','Нэг ханзаас холбоотой үгс рүү салаалуулж сур.','word-trees'],
        ['5','Зурагт ханз тогтооё','250 зурагт картын зургийг хараад ханзыг сана.','pictures'],
        ['6','Цаасан дээр бичье','Өөрийн үгсээр дагаж бичих болон хоосон нүдтэй хуудас.','worksheets']
      ].map(([n,title,text,view]) => `<button class="learning-tile" onclick="learnView('${view}')"><span class="step-number">${n}</span><h3>${title}</h3><p>${text}</p></button>`).join('')}</div><div class="learn-panel"><h3>Давталт</h3><p>Үгийн сангаас сурах үгээ картдаа нэм. Хугацаа болсон картуудаа өдөр бүр давтаарай.</p>${learnButton('Давтах картууд',"switchTab('srs')")}${learnButton('Сонсох сорил',"switchTab('quiz');startQuizMode('listening')")}</div>`;
  } else if (Learn.view === 'lessons') renderLessonList(target);
  else if (Learn.view === 'lesson') renderLesson(target);
  else if (Learn.view === 'basics') renderBasics(target);
  else if (Learn.view === 'radicals') renderRadicals(target);
  else if (Learn.view === 'radical-lesson') renderRadicalLesson(target);
  else if (Learn.view === 'word-trees') renderWordTrees(target);
  else if (Learn.view === 'pictures') renderPicture(target);
  else if (Learn.view === 'worksheets') renderWorksheetForm(target);
}
function renderLessonList(target) {
  target.innerHTML = `<h2>HSK хичээлүүд</h2><p>17 сонгосон суурь хичээл. Түвшний шошго нь сурах дарааллын баримжаа; шалгалтын бүх дүрмийг хамарсан бүрэн курс биш. Үгийн сан нь шинэ HSK-ийн 11,000 үгтэй хэвээр.</p><label class="learn-label">Сурах түвшин <select onchange="Learn.level=this.value;renderLearn()">${['all','HSK 1','HSK 2','HSK 3','HSK 4','HSK 5','HSK 6','HSK 7–9'].map(l => `<option ${Learn.level === l ? 'selected' : ''} value="${l}">${l === 'all' ? 'Бүх түвшин' : l}</option>`).join('')}</select></label><div class="learning-grid">${AppState.grammarLessons.filter(l => Learn.level === 'all' || l.level === Learn.level).map(l => `<button class="learning-tile" onclick="openLesson('${l.id}')"><span class="level-tag">${l.level} ${learningProgress()[l.id] ? '✓ Дасгал давсан' : ''}</span><h3>${escapeHtml(l.title)}</h3><p>${escapeHtml(l.summary)}</p><span>Тайлбар · Жишээ · 2 дасгал →</span></button>`).join('')}</div>`;
}
function openLesson(id) { Learn.lesson = id; Learn.answers = {}; Learn.order = []; learnView('lesson'); }
function renderLesson(target) {
  const lesson = AppState.grammarLessons.find(l => l.id === Learn.lesson), q = LESSON_PRACTICE[Learn.lesson];
  if (!lesson || !q) return learnView('lessons');
  const tokens = q[7].split('|');
  const questions = [{prompt:q[0],context:q[1],options:q[2],correct:q[3],explanation:q[4]}];
  target.innerHTML = `${learnButton('← Хичээлүүд',"learnView('lessons')")}<article class="learn-panel"><span class="level-tag">${lesson.level}</span><h2>${escapeHtml(lesson.title)}</h2><h3>1. Ойлгох</h3><div class="lesson-reading">${formatMarkdown(lesson.content)}</div><h3>2. Сонсоод давтах</h3><p class="chinese-example">${escapeHtml(q[5])}</p><p>${escapeHtml(q[6])}</p>${learnButton('🔊 Сонсох', `speakText('${q[5]}')`)}${learnButton('✍ Ханзыг бичих',`learnWrite('${q[5]}')`)}${learnButton('Хэвлэх дасгал', `lessonWorksheet('${q[5]}')`)}<h3>3. Ойлгосноо шалгах</h3><p>Хоёр дасгалыг зөв хийвэл хичээл давсанд тооцно. Буруу бол тайлбарыг уншаад дахин сонгоорой.</p>${questions.map((item,i) => {
    const answer = Learn.answers[i];
    return `<fieldset class="lesson-question"><legend>${i+1}. ${escapeHtml(item.prompt)}</legend><p>${escapeHtml(item.context)}</p><div class="lesson-options">${item.options.map((text,j) => `<button class="learn-button ${answer === j ? (j === item.correct ? 'answer-right' : 'answer-wrong') : ''}" onclick="answerLesson(${i},${j})">${escapeHtml(text)}</button>`).join('')}</div>${answer !== undefined ? `<p role="status">${answer === item.correct ? '✓ Зөв.' : 'Дахин оролдоорой.'} ${escapeHtml(item.explanation)}</p>` : ''}</fieldset>`;
  }).join('')}<fieldset class="lesson-question"><legend>2. Үгсийг зөв дарааллаар дарж эвлүүл.</legend><p>${escapeHtml(q[6])}</p><p class="sentence-build" aria-live="polite">${Learn.order.map(i=>escapeHtml(tokens[i])).join(' · ') || 'Энд өгүүлбэрээ эвлүүлнэ…'}</p><div>${tokens.map((_,i)=>tokens.length-1-i).map(i=>`<button class="learn-button" onclick="orderLesson(${i})" ${Learn.order.includes(i)?'disabled':''}>${escapeHtml(tokens[i])}</button>`).join('')}</div>${learnButton('Дахин эвлүүлэх','Learn.order=[];renderLearn()')}${Learn.order.length===tokens.length ? `<p role="status">${Learn.order.map(i=>tokens[i]).join('')===tokens.join('') ? '✓ Зөв эвлүүллээ.' : 'Дараалал тохирохгүй байна. Жишээний бүтцийг хараад дахин эвлүүлээрэй.'}</p>` : ''}</fieldset><div id="lesson-completion" role="status"></div></article>`;
  if (Learn.answers[0] === q[3] && Learn.order.map(i=>tokens[i]).join('') === tokens.join('')) {
    saveLearning(lesson.id, true);
    const next = AppState.grammarLessons[AppState.grammarLessons.indexOf(lesson)+1];
    document.getElementById('lesson-completion').innerHTML = `<p>✓ Хоёр дасгал зөв. Одоо жишээ өгүүлбэрээ өөрийн үгээр өөрчилж хэлээрэй.</p>${next ? learnButton('Дараагийн хичээл →',`openLesson('${next.id}')`) : learnButton('Картуудаа давтах',"switchTab('srs')")}${learnButton('Энэ хичээлийн ахицыг буцаах',`resetLesson('${lesson.id}')`)}`;
  }
}
function answerLesson(index, answer) { Learn.answers[index] = answer; renderLearn(); }
function resetLesson(id) { saveLearning(id,false); openLesson(id); }
function orderLesson(index) { if (!Learn.order.includes(index)) Learn.order.push(index); renderLearn(); }
function learnWrite(text) { const chars = [...text].filter(c => /\p{Script=Han}/u.test(c)).join(''); if (chars) openInWriter(chars, null, 'all'); }
function lessonWorksheet(text) { learnView('worksheets'); document.getElementById('worksheet-text').value = text; previewWorksheet(); }
function renderBasics(target) {
  target.innerHTML = `<article class="learn-panel"><h2>Авиа, хөгөөс эхэлье</h2><p>Pinyin бол ханзны дуудлагыг латин үсгээр тэмдэглэх арга. Эхний гийгүүлэгч, төгсгөлийн эгшиг, хөгийг хамт сурна.</p><div class="learning-grid">${[['mā','妈','эх','1: өндөр тэгш →'],['má','麻','олс ургамал','2: дээш өгсөх ↗'],['mǎ','马','морь','3: намсаж эргэх ↘↗'],['mà','骂','загнах','4: огцом буух ↘'],['ma','吗','асуух сул үг','Сул хөг: богино, хөнгөн']].map(([p,c,m,t]) => `<div class="learning-tile"><h3>${p} · ${c}</h3><p>${m} · ${t}</p>${learnButton('🔊 Сонсох',`speakText('${c}')`)}</div>`).join('')}</div><p>3-р хөгийн араас 3-р хөг орвол эхнийх нь 2-р хөг шиг дуудагдана: 你好 → ní hǎo. 不 нь 4-р хөгийн өмнө bú болно: 不是. 一-ийн хөг нь дараагийн үеэс хамааран өөрчлөгдөнө.</p><h2>Үндсэн 8 зурлага</h2><p>Энэ нь эхлэхэд хэрэгтэй найман төрөл. Нийлмэл нугалаа, дэгээтэй бүх хувилбарыг энд бүрэн жагсаагаагүй.</p><div class="stroke-grid">${[['横','héng','хэвтээ','M12 50H88'],['竖','shù','босоо','M50 12V88'],['撇','piě','зүүн ташуу','M74 12Q65 65 20 88'],['捺','nà','баруун ташуу','M25 12Q38 68 87 88'],['点','diǎn','цэг','M38 25Q52 38 58 55'],['提','tí','дээш татах','M20 75L80 30'],['折','zhé','нугалаа','M15 25H75V85'],['钩','gōu','дэгээ','M60 12V78Q60 91 42 75']].map(([c,p,m,d]) => `<div class="learning-tile"><svg viewBox="0 0 100 100" aria-label="${m}" role="img"><path d="${d}" class="basic-stroke"/></svg><strong>${c} ${p}</strong><p>${m}</p></div>`).join('')}</div><h3>Бичих дарааллын суурь</h3><ol><li>Дээрээс доош: 三.</li><li>Зүүнээс баруун: 你.</li><li>Огтлолцвол ихэвчлэн хэвтээг эхэлж: 十.</li><li>Гадна хүрээг эхэлж, доторхыг бичээд, доод талыг сүүлд хаана: 国.</li></ol><p>Ерөнхий дүрэмд үл хамаарах ханз бий. “Бичих” хэсгийн тухайн ханзны хөдөлгөөнт дарааллыг дагаарай.</p>${learnButton('三 十 国-г бичих',"learnWrite('三十国')")}${learnButton('Радикал судлах →',"learnView('radicals')")}</article>`;
}
function renderRadicals(target) { renderRadicalLibrary(target); }
function picturePool() { return (window.PICTURE_CARDS || []).filter(c => Learn.pack === 'all' || c.source === Learn.pack); }
function renderPicture(target) {
  const pool = picturePool(); Learn.picture = Math.max(0, Math.min(Learn.picture, pool.length-1));
  const c = pool[Learn.picture]; if (!c) { target.innerHTML='<p>Зурагт картын өгөгдөл олдсонгүй.</p>'; return; }
  const known = !!learningProgress()['picture-'+c.id];
  const match = getAllWordsPool().find(w=>w.simplified === c.hanzi && (w.pinyin||'').normalize('NFC') === c.pinyin.normalize('NFC'));
  target.innerHTML = `<h2>Зургаар ханз тогтооё</h2><p>Эхлээд зурагт тохирох ханзыг сана. “Хариуг харах” дээр ханз, дуудлага бүхий эх карт нээгдэнэ. Зургууд нь цээжлэх туслах дүрслэл; ханзны үүслийн баталгаа биш.</p><label class="learn-label">Багц <select onchange="Learn.pack=this.value;Learn.picture=0;Learn.revealed=false;renderLearn()">${['all','1-50.pdf','51-100.pdf','101-150.pdf','151-200.pdf','201-250.pdf'].map(p => `<option value="${p}" ${Learn.pack === p ? 'selected' : ''}>${p === 'all' ? 'Бүх 250 карт' : p}</option>`).join('')}</select></label><div class="picture-toolbar">${learnButton('← Өмнөх', 'movePicture(-1)')}<label>Карт <input aria-label="Картын дугаар" type="number" min="1" max="${pool.length}" value="${Learn.picture+1}" id="picture-page" onkeydown="if(event.key==='Enter') jumpPicture(this.value)"> / ${pool.length}</label>${learnButton('Очих',"jumpPicture(document.getElementById('picture-page').value)")}${learnButton('Дараах →' ,'movePicture(1)')}</div><div class="picture-card"><img src="${Learn.revealed ? c.image : c.front}" alt="${Learn.revealed ? 'Ханз ба дуудлагатай эх карт' : 'Ханзыг санахад туслах зураг'}" loading="lazy"><p>${escapeHtml(c.source)} · PDF хуудас ${c.page}</p></div><div class="picture-toolbar">${learnButton(Learn.revealed ? 'Зөвхөн зураг харах' : 'Хариуг харах','Learn.revealed=!Learn.revealed;renderLearn()')}${Learn.revealed ? learnButton(known ? '✓ Тогтоосон · буцаах' : 'Тогтоосон гэж тэмдэглэх',`saveLearning('picture-${c.id}',${!known});renderLearn()`) : ''}</div>${Learn.revealed ? `<label class="learn-label">Карт дээрх ханзыг бичээд дадлага хийх <input id="picture-hanzi" maxlength="12" placeholder="Жишээ: 人" lang="zh"></label>${learnButton('✍ Ханз бичих',"learnWrite(document.getElementById('picture-hanzi').value)")}` : ''}<p class="learn-source">Таны таван PDF-ээс оруулсан 250 эх карт. PDF хуудасны дугаар болон карт дээр хэвлэсэн дугаар ялгаатай байж болно. Зурагт багц нь HSK түвшний үгийн тоонд нэмэгдэхгүй. Ханзыг OCR-оор таамаглан шошголоогүй.</p>`;
  if (Learn.revealed) {
    const answer = document.createElement('div');
    answer.className = 'learn-panel picture-answer';
    answer.innerHTML = `<h3 lang="zh">${c.hanzi} <small>${c.pinyin}</small></h3><p>${escapeHtml(c.mongolian)}</p><p lang="en">${escapeHtml(c.english)}</p>${learnButton('✍ Энэ ханзыг бичих',`learnWrite('${c.hanzi}')`)}${learnButton('Хэвлэх дасгал',`lessonWorksheet('${c.hanzi}')`)}${match ? `<p>Шинэ HSK ${String(match.level).replace('_','–')} · Үгийн санд байна</p>${learnButton(AppState.srsCards.some(w=>w.id===match.id)?'Картнаас хасах':'Давтах картдаа нэмэх',`toggleSRSWord('${match.id}');renderLearn()`)}` : '<p>Энэ ханз ба дуудлагад яг тохирох HSK нэгжийг автоматаар холбоогүй.</p>'}`;
    const manual = target.querySelector('#picture-hanzi');
    if (manual) { manual.closest('label').remove(); const manualButton=target.querySelector('button[onclick*="picture-hanzi"]'); if(manualButton) manualButton.remove(); }
    target.querySelector('.picture-card').after(answer);
    const speech = document.createElement('button');
    speech.className='learn-button'; speech.textContent='🔊 Сонсох';
    speech.addEventListener('click',()=>speakText({'089':'吐丝','166':'高兴','168':'头发','203':'圆圈','216':'床铺','234':'一只'}[c.id] || c.hanzi));
    answer.append(speech);
    const note=target.querySelector('.learn-source');
    note.textContent='Таны 5 PDF-ийн 250 картын үндсэн ханзыг зургаас нягталж, монгол болон англи утга нэмэв. Эх файл, PDF хуудсыг хадгалсан. Зурагт багц нь HSK үгийн тоонд нэмэгдэхгүй. Энд сонгосон утга, дуудлагыг харуулна; олон дуудлагатай ханзны бусад утга байж болно.';
  }
}
function movePicture(delta) { const n=picturePool().length; Learn.picture=(Learn.picture+delta+n)%n; Learn.revealed=false; renderLearn(); }
function jumpPicture(value) { const n=Number(value); if(Number.isInteger(n)) Learn.picture=Math.max(0,Math.min(n-1,picturePool().length-1)); Learn.revealed=false; renderLearn(); }
function worksheetCharacters(text) { return [...new Set([...text].filter(c=>/\p{Script=Han}/u.test(c)))].slice(0,12); }
function renderWorksheetForm(target) {
  target.innerHTML = `<h2>Өөрийн бичих дасгалын хуудас</h2><p>12 хүртэл ялгаатай ханз оруулна. Ханз бүр нэг мөр: загвар → дагах нүд → өөрөө бичих нүд. Олон үгтэй бол ханз бүрээр нь салгана.</p><div class="learn-panel worksheet-controls"><label class="learn-label">Ханз эсвэл өгүүлбэр <textarea id="worksheet-text" rows="2" maxlength="200">人山水日月木</textarea></label><label class="learn-label">Бэлэн үгс <select onchange="worksheetFromLevel(this.value)"><option value="">Сонгох…</option>${['1','2','3','4','5','6','7_9'].map(l=>`<option value="${l}">HSK ${l.replace('_','–')} · эхний 6 үг</option>`).join('')}</select></label><label class="learn-label">Бичих арга <select id="worksheet-mode"><option value="mixed">2 нүд дагах + 5 нүд өөрөө бичих</option><option value="trace">Бүх нүдэнд бүдэг загвар</option><option value="memory">Бүдэг загваргүй</option></select></label><label><input id="worksheet-labels" type="checkbox" checked> Тольд буй нэг ханзны дуудлага, монгол утгыг харуулах</label><div>${learnButton('Урьдчилан харах','previewWorksheet()')}${learnButton('Хэвлэх / PDF хадгалах','printWorksheet()')}</div><p id="worksheet-status" role="status"></p></div><div id="worksheet-preview"></div><p class="learn-source">Өөрийн локал зурлагын өгөгдлөөс үүсгэнэ. <a href="https://www.hanzistroke.com/worksheets" target="_blank" rel="noopener">HanziStroke нэмэлт дасгалын эх сурвалж ↗</a></p>`;
  previewWorksheet();
}
function worksheetFromLevel(level) { if(!level) return; document.getElementById('worksheet-text').value=(window.MONGOL_HSK_DATA['hsk'+level]||[]).slice(0,6).map(w=>w.simplified).join(' '); previewWorksheet(); }
function sheetGlyph(char) {
  const data=AppState.strokesData[char];
  if(data?.strokes?.length) return `<svg viewBox="0 0 1024 1024" aria-label="${char}"><g transform="translate(0,900) scale(1,-1)">${data.strokes.map(d=>`<path d="${escapeHtml(d)}"/>`).join('')}</g></svg>`;
  return `<span>${char}</span>`;
}
function previewWorksheet() {
  const text=document.getElementById('worksheet-text').value, chars=worksheetCharacters(text), mode=document.getElementById('worksheet-mode').value, labels=document.getElementById('worksheet-labels').checked;
  document.getElementById('worksheet-status').textContent=chars.length ? `${chars.length} ханз · A4 хэмжээ. Хэвлэх цонхноос “Save as PDF” сонгож болно.` : 'Хэвлэхийн тулд дор хаяж нэг ханз оруулна уу.';
  const pool=getAllWordsPool();
  document.getElementById('worksheet-preview').innerHTML= chars.length ? `<div class="worksheet-paper"><h2>Ханз бичих дадлага</h2><p>Нэр: ____________________ Огноо: ______________</p>${chars.map(c=>{
    const word=pool.find(w=>w.simplified === c) || (window.PICTURE_CARDS || []).find(w=>w.hanzi === c), glyph=sheetGlyph(c);
    return `<section class="worksheet-row"><div class="worksheet-caption"><strong>${c}</strong> ${labels && word ? escapeHtml(word.pinyin+' · '+word.mongolian) : ''}</div><div class="writing-cells"><div class="writing-cell model">${glyph}</div>${Array.from({length:7},(_,i)=>`<div class="writing-cell ${mode==='trace'||mode==='mixed'&&i<2?'trace':''}">${mode==='trace'||mode==='mixed'&&i<2?glyph:''}</div>`).join('')}</div></section>`;
  }).join('')}<small>НАХИА · Өөрийн дасгалын хуудас</small></div>` : '';
}
function printWorksheet() { previewWorksheet(); if(!worksheetCharacters(document.getElementById('worksheet-text').value).length) return; document.body.classList.add('printing-worksheet'); window.print(); }
window.addEventListener('afterprint',()=>document.body.classList.remove('printing-worksheet'));
