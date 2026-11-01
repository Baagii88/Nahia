/* Radical lessons use verified component-to-stroke paths, never geometric guesses. */
const RadicalStudy = { id: null, query: '', strokes: 'all', group: 'start', answers: {}, color: true, expanded: false };
const RADICAL_NOTES = {
  9:'人 нь хүн. Ханзны зүүн талд 亻 болж бичигдэх нь түгээмэл. Жишээний үгийн утгыг бүхлээр нь сур: нэг хэсгээс нь бүтэн утгыг тааж болохгүй.',
  15:'冫 нь мөсний радикал. 冰, 冷, 冻-д хүйтэн, мөсний утгыг тогтооход тустай. Харин 净, 准 зэрэг ханзны өнөөгийн утгыг “хүйтэн” гэж тайлбарлахгүй.',
  30:'口 нь ам гэсэн утгатай. Ярих, идэхтэй холбоотой ханзанд таарах боловч дүрсний бүрэлдэхүүн болох тохиолдол ч бий. Битүү хүрээ 囗-тай ялгаарай.',
  32:'土 нь газар, шороо. 土-д доод хэвтээ зураас урт; 士-д дээд хэвтээ зураас урт. Энэ харьцааг бичихдээ ажиглаарай.',
  38:'女 нь эмэгтэй. 妈, 姐, 妹 зэрэг гэр бүлийн үгсийг хамтад нь тогтоож болно. Орчин үеийн бүх ханзны утгыг радикалаар нь таахгүй.',
  61:'心 нь зүрх, сэтгэл. Зүүн талд 忄, доод талд 心 зэрэг хэлбэрээр орно. Байрлал өөрчлөгдөхөд хэлбэр өөрчлөгдөж болохыг харьцуул.',
  64:'手 нь гар. Зүүн талын хэлбэр нь 扌. 打, 拉, 推 зэрэг гарын үйлдлийг жишээ үгтэй нь сур.',
  72:'日 нь нар, өдөр. 曰 нь “хэлэх” гэсэн тусдаа радикал. Зөвхөн өргөн, өндрөөр таахын оронд үг болон бичих дараалалтай нь хамт тогтоо.',
  74:'月 нь сар. Махны 肉 радикалын ⺼ хэлбэртэй зарим фонтод маш төстэй. 明-ийн 月, 肚-ийн ⺼-ийг нэг радикал гэж нэгтгэхгүй.',
  75:'木 нь мод. 林, 森-д давтагдсан дүрсийг ажигла. Харин модон зүйлтэй холбоотой бүх үг заавал 木 агуулдаггүй.',
  85:'水 нь ус; зүүн талд 氵 гэсэн гурван цэгтэй хэлбэр түгээмэл. Хоёр цэгтэй 冫-тай ялгаж сур. 河, 海, 清 зэрэг ханзыг үгээр нь тогтоо.',
  86:'火 нь гал. Доод талд 灬 гэсэн хэлбэрээр орж болно. 熱/热 зэрэг жишээнд дүрсний хувилбарыг ажигла.',
  94:'犬 нь нохой; зүүн талын хэлбэр 犭. Энэ бүрэлдэхүүнтэй зарим ханз амьтны нэр байдаг. Бүх жишээг нохой гэсэн утгатай гэж ойлгохгүй.',
  96:'玉 нь хаш. Олон ханзанд 王-той төстэй хэлбэрээр орно. Дан 王 “хаан” болон 玉 “хаш”-ийг утгаар нь тусад нь сур.',
  104:'疒 нь өвчний радикал. Дээрээс болон зүүнээс хүрээлсэн хэлбэртэй. Доторх хэсгийн дуудлага, үгийн утгыг хамт тогтоо.',
  113:'示 нь үзүүлэх, тахилгын утгатай. Зүүн талд 礻 болно. Хувцасны 衣 → 衤 хувилбар нэмэлт нэг зураастай тул ялгаж ажигла.',
  118:'竹 нь хулс. Дээд талын хэлбэр нь ⺮. Хулсан эдлэлтэй холбоотой жишээ байдаг ч орчин үеийн утгыг дан радикалаар дүгнэхгүй.',
  120:'糸 нь торго, утас. Хялбаршуулсан зүүн талын хэлбэр 纟, уламжлалт хэлбэр 糹. Ханз бүхлээрээ хялбаршсан эсэхийг мөн шалга.',
  130:'肉 нь мах. Ханзанд ⺼ болж бичигдэх нь түгээмэл; зарим фонтод 月 шиг харагдана. 肚, 脸, 腿 зэрэг биеийн хэсгийг заасан үгтэй хамт сур.',
  140:'艸 нь өвс. Дээд талын хэлбэр 艹. 花, 草, 茶, 菜-г бүлэглэж тогтоох боломжтой.',
  145:'衣 нь хувцас; зүүн талд 衤. 礻-тэй андуурахгүй. 裤, 被 зэрэг жишээнд тодруулсан зураасыг харьцуул.',
  149:'言 нь үг, яриа. Хялбаршуулсан зүүн талын хэлбэр 讠. 说, 话, 请, 语 зэрэг үгийг сонсож, өгүүлбэрт хэрэглэж сур.',
  154:'貝 нь хясаа; хялбаршуулсан хэлбэр 贝. Мөнгө, худалдаатай холбоотой жишээ түгээмэл боловч өнөөгийн бүх утгыг үүнээс тайлбарлахгүй.',
  157:'足 нь хөл. Зүүн талд бичигдэх хэлбэрийн доод хэсэг өөрчлөгдөнө. 跑, 路 зэрэг жишээний хөдөлгөөн, байрлалыг ажигла.',
  162:'辵 нь алхахтай холбоотой. 辶 хэлбэр нь зүүн доогуур хүрээлнэ. Бичихдээ тухайн ханзны хөдөлгөөнт дарааллыг дагаарай.',
  163:'Баруун талын 阝 нь 邑 “хот, суурин” радикалын хувилбар. 都, 郊, 邻, 邮-д баруун талд байгааг хар. 都 нь dōu “бүгд”, dū “нийслэл” гэсэн өөр дуудлага, утгатай.',
  167:'金 нь алт, металл. Хялбаршуулсан зүүн талын хэлбэр 钅. Төмөрлөг эдлэлтэй холбоотой жишээг үгтэй нь хамт сур.',
  170:'Зүүн талын 阝 нь 阜 “дов, толгод” радикалын хувилбар. Баруун талын 邑 → 阝-тай ижил дүрстэй ч өөр радикал. Байрлалыг хамгийн түрүүнд шалга.'
};
const RADICAL_COMPARISONS = [
  {ids:[15,85],title:'冫 ба 氵',text:'冫: хоёр цэг, мөсний радикал. 氵: гурван цэг, усны радикал.',samples:['冷','清']},
  {ids:[163,170],title:'Баруун 阝 ба зүүн 阝',text:'都-ийн баруун 阝 → 邑 (хот). 院-ийн зүүн 阝 → 阜 (дов). Байрлалаар ялгана.',samples:['都','院']},
  {ids:[74,130],title:'Сар 月 ба мах ⺼',text:'明-ийн 月 нь сар. 肚-ийн ⺼ нь махны 肉-ийн хувилбар. Зарим фонтод төстэй харагддаг.',samples:['明','肚']},
  {ids:[30,31],title:'Ам 口 ба хүрээ 囗',text:'口 нь ам. 囗 нь бусад хэсгийг гаднаас нь хүрээлдэг: 国-д 玉-г тойрсон хэсэг.',samples:['吃','国']},
  {ids:[32,33],title:'Газар 土 ба эрдэмтэн 士',text:'土-д доод хэвтээ зураас урт. 士-д дээд хэвтээ зураас урт.',samples:['土','士']},
  {ids:[72,73],title:'Нар 日 ба хэлэх 曰',text:'日 (rì) нь нар, өдөр; 曰 (yuē) нь хэлэх. Үг, утга, бичих хэлбэрийг хамтад нь тогтоо.',samples:['日','曰']},
  {ids:[113,145],title:'礻 ба 衤',text:'礻 нь 示-ийн хувилбар; 衤 нь 衣-ийн хувилбар. 衤 нэмэлт нэг зураастай.',samples:['礼','被']}
];
const RADICAL_POSITIONS = {self:'Бие даасан хэлбэр',left:'Зүүн талд',right:'Баруун талд',top:'Дээд талд',bottom:'Доод талд',inside:'Хүрээлсэн / нийлмэл бүтцэд'};
const RADICAL_ROLES = {self:'Үндсэн буюу хувилбар хэлбэр',semantic:'Утгын холбоотой хэсэг',phonetic:'Дуудлагын холбоотой хэсэг',component:'Дүрсний бүрэлдэхүүн'};
function radicalById(id) { return window.RADICALS.find(r=>r.number===Number(id)); }
function radicalLesson(id) { return window.RADICAL_LESSONS.lessons.find(l=>l.number===Number(id)); }
function radicalSequence() { return RadicalStudy.group==='start' ? window.RADICAL_LESSONS.order : window.RADICALS.map(r=>r.number); }
function openRadical(id) {
  if (!radicalById(id)) return;
  RadicalStudy.id=Number(id); RadicalStudy.answers={}; RadicalStudy.color=true; RadicalStudy.expanded=false;
  if (!radicalSequence().includes(Number(id))) RadicalStudy.group='all';
  learnView('radical-lesson');
}
function moveRadical(delta) {
  const ids=radicalSequence(), index=ids.indexOf(RadicalStudy.id);
  openRadical(ids[(index+delta+ids.length)%ids.length]);
}
function renderRadicalLibrary(target) {
  const done=window.RADICALS.filter(r=>learningProgress()['radical-'+r.number]).length;
  const next=window.RADICAL_LESSONS.order.find(id=>!learningProgress()['radical-'+id]) || window.RADICAL_LESSONS.order[0];
  target.innerHTML=`<div class="learn-hero"><span class="level-tag">Ханз тогтоох · Радикалаар сурах</span><h2>214 радикалыг жишээгээр суръя</h2><p>Эхлээд түгээмэл 30 радикалыг санал болгосон дарааллаар үз. Дотроос нь өнгөөр ялгасан ханз, үгийн холбоос, тайлбар, хоёр дасгал нээнэ.</p>${learnButton('Радикалын хичээлээ эхлэх',`openRadical(${next})`)}<p>${done} / 214 хичээлийн дасгалыг давсан</p></div><label class="learn-label">Сурах багц <select id="radical-group" onchange="RadicalStudy.group=this.value;filterRadicals(document.getElementById('radical-search').value)"><option value="start" ${RadicalStudy.group==='start'?'selected':''}>Эхлэх 30 радикал · сурах дарааллаар</option><option value="all" ${RadicalStudy.group==='all'?'selected':''}>Бүх 214 радикал · Канси индексээр</option></select></label><label class="learn-label">Радикал хайх <input id="radical-search" type="search" value="${escapeHtml(RadicalStudy.query)}" placeholder="氵, ус, shuǐ…" oninput="filterRadicals(this.value)"></label><label class="learn-label">Үндсэн хэлбэрийн зурлагын тоо <select id="radical-count" onchange="RadicalStudy.strokes=this.value;filterRadicals(document.getElementById('radical-search').value)"><option value="all">Бүгд</option>${Array.from({length:17},(_,i)=>`<option value="${i+1}" ${RadicalStudy.strokes===String(i+1)?'selected':''}>${i+1}</option>`).join('')}</select></label><p id="radical-result-count" role="status"></p><div id="radical-results" class="radical-grid"></div><aside class="learn-panel"><h3>Зурлага, радикал, бүрэлдэхүүн</h3><p>Зурлага бол нэг хөдөлгөөн. Радикал бол тольд ангилах үндсэн хэсэг. Нэг ханз хэд хэдэн бүрэлдэхүүнтэй байж болно; тэдгээрийг бүгдийг нь тухайн ханзны толь зүйн радикал гэж нэрлэхгүй.</p><p>Утгын холбоо, дуудлагын холбоо, зөвхөн дүрсний бүрэлдэхүүнийг тусад нь тэмдэглэнэ. Энэ нь бүх ханзны түүхэн гарал үүслийг баталсан тайлбар биш.</p></aside><p class="learn-source">Канси индекс, Make Me a Hanzi бүтцийн лавлах. <a href="https://www.mdbg.net/chinese/dictionary.php?page=radicals" target="_blank" rel="noopener">Радикалын толь ↗</a></p>`;
  filterRadicals(RadicalStudy.query);
}
function filterRadicals(query) {
  RadicalStudy.query=query;
  const sequence=radicalSequence(), trimmed=query.trim().toLowerCase();
  // A search always covers all 214, so the starter selection cannot hide a match.
  const ids=trimmed ? window.RADICALS.map(r=>r.number) : sequence;
  const list=ids.map(radicalById).filter(r=>(RadicalStudy.strokes==='all'||r.strokes===Number(RadicalStudy.strokes)) && [r.char,r.pinyin,r.mn,r.meaning,...r.variants,...r.simplified].join(' ').normalize('NFC').toLowerCase().includes(trimmed.normalize('NFC')));
  document.getElementById('radical-result-count').textContent=`${list.length} радикал${trimmed?' · бүх 214-өөс хайв':''}`;
  document.getElementById('radical-results').innerHTML=list.map(r=>{
    const lesson=radicalLesson(r.number), done=learningProgress()['radical-'+r.number];
    return `<button class="learning-tile radical-lesson-tile" onclick="openRadical(${r.number})"><span class="level-tag">№${r.number} · ${r.strokes} зурлага ${done?'✓':''}</span><span class="radical-glyph">${r.char}</span><strong>${escapeHtml(r.pinyin)} · ${escapeHtml(r.mn)}</strong><p>${escapeHtml([...new Set([...r.variants,...r.simplified])].join(' · '))||'Үндсэн хэлбэр'}</p><p>${lesson.examples.map(e=>e.char).join(' · ')}</p><span>Жишээ, тайлбар, дасгал →</span></button>`;
  }).join('')||'<p>Тохирох радикал олдсонгүй. Зурлагын тооны шүүлтийг “Бүгд” болгоод үзээрэй.</p>';
}
function radicalGlyph(char, highlight=[], color=true) {
  const data=AppState.strokesData[char] || window.RADICAL_LESSONS.strokes[char];
  if (!data?.strokes?.length) return `<span class="radical-fallback">${char}</span>`;
  const selected=new Set(highlight);
  return `<svg class="radical-diagram" viewBox="0 0 1024 1024" role="img" aria-label="${char}${color && highlight.length?' — судалж буй хэсгийг улбар шараар тодруулав':''}"><g transform="translate(0,900) scale(1,-1)">${data.strokes.map((path,i)=>`<path class="${color&&selected.has(i)?'radical-selected-stroke':'radical-other-stroke'}" d="${escapeHtml(path)}"/>`).join('')}</g></svg>`;
}
function radicalWrite(char) {
  for (const c of char) if (window.RADICAL_LESSONS.strokes[c]) AppState.strokesData[c]=window.RADICAL_LESSONS.strokes[c];
  learnWrite(char);
}
function radicalComparison(id) { return RADICAL_COMPARISONS.find(p=>p.ids.includes(Number(id))); }
function renderRadicalComparison(pair) {
  return `<aside class="radical-comparison"><h3>3. ${pair.title}</h3><p>${pair.text}</p><div class="radical-comparison-grid">${pair.ids.map((id,i)=>{
    const r=radicalById(id), e=radicalLesson(id).examples.find(e=>e.char===pair.samples[i]);
    const char=e?.char||r.char, data=AppState.strokesData[char]||window.RADICAL_LESSONS.strokes[char];
    const mask=e?.highlight||data.strokes.map((_,j)=>j);
    return `<div>${radicalGlyph(char,mask,true)}${learnButton(`${r.char} — ${r.mn}`,`openRadical(${id})`)}</div>`;
  }).join('')}</div></aside>`;
}
function radicalExercises(id) {
  const r=radicalById(id), lesson=radicalLesson(id);
  // Fixed rotations retain answer positions while a learner retries a question.
  const other=[...window.RADICALS].filter(o=>o.number!==r.number && o.char!==r.char && o.mn!==r.mn);
  const candidates=[r], usedMeanings=new Set([r.mn]);
  for(let offset=29;candidates.length<4;offset++) {
    const candidate=other[(r.number+offset)%other.length];
    if(!usedMeanings.has(candidate.mn)) { candidates.push(candidate); usedMeanings.add(candidate.mn); }
  }
  const shift=r.number%4, options=[...candidates.slice(shift),...candidates.slice(0,shift)];
  const first={prompt:'Улбар шар хэсгийн үндсэн радикалыг сонго.',options:options.map(o=>({label:o.char,id:o.number})),correct:r.number,
    explanation:`${lesson.examples[0].part} хэсэг нь ${r.char} радикалын үндсэн эсвэл хувилбар хэлбэр. ${RADICAL_POSITIONS[lesson.examples[0].position]}.`};
  let second={prompt:`${r.char} радикалын сурах үндсэн утга аль вэ?`,options:options.map(o=>({label:o.mn,id:o.number})),correct:r.number,
    explanation:`${r.char} — ${r.mn}. Энэ утгаар бүх жишээ ханзны өнөөгийн утгыг шууд тайлбарлаж болохгүй.`};
  if (r.number===163 || r.number===170) {
    second={prompt:'Энэ хичээлийн 阝 ямар байрлал, гаралтай вэ?',options:[{label:'Баруун талд · 邑 — хот, суурин',id:163},{label:'Зүүн талд · 阜 — дов, толгод',id:170},{label:'Аль ч талд ижил радикал',id:0}],correct:r.number,explanation:RADICAL_NOTES[r.number]};
  } else if(r.number===15||r.number===85) {
    second={prompt:'冫 болон 氵-ийн зөв ялгааг сонго.',options:[{label:'冫 хоёр цэг · мөс; 氵 гурван цэг · ус',id:1},{label:'冫 гурван цэг · ус; 氵 хоёр цэг · мөс',id:2},{label:'Ялгаагүй, нэг радикал',id:3}],correct:1,explanation:'冫 нь мөсний радикал. 氵 нь 水 усны радикалын хэлбэр. Цэгийн тоо, байрлалыг ажигла.'};
  }
  return [first,second];
}
function renderRadicalLesson(target) {
  const r=radicalById(RadicalStudy.id), lesson=radicalLesson(RadicalStudy.id);
  if (!r||!lesson) return learnView('radicals');
  const comparison=radicalComparison(r.number), questions=radicalExercises(r.number), variants=[...new Set([r.char,...r.variants,...r.simplified])];
  const nextIds=radicalSequence(), index=nextIds.indexOf(r.number);
  const passed=questions.every((q,i)=>RadicalStudy.answers[i]===q.correct);
  if(passed) saveLearning('radical-'+r.number,true);
  target.innerHTML=`<div class="radical-lesson-toolbar">${learnButton('← Радикалууд',"learnView('radicals')")}${learnButton('Өмнөх','moveRadical(-1)')}<span>${index+1} / ${nextIds.length}</span>${learnButton('Дараах →','moveRadical(1)')}${learnButton('Дасгал руу очих',"document.getElementById('radical-practice').scrollIntoView({behavior:'smooth',block:'start'})")}</div><article class="learn-panel"><span class="level-tag">№${r.number} · ${lesson.common?'Эхлэх 30':'Лавлах хичээл'} · ${r.strokes} зурлага</span><div class="radical-lesson-heading"><span class="radical-glyph">${r.char}</span><div><h2>${escapeHtml(r.mn)}</h2><p>${escapeHtml(r.pinyin)} · <span lang="en">${escapeHtml(r.meaning)}</span></p></div></div><h3>1. Хэлбэр ба утга</h3><div class="radical-variant-list">${variants.map(c=>`<span class="radical-variant">${c}</span>`).join('<span aria-hidden="true">↔</span>')}</div><p>${escapeHtml(RADICAL_NOTES[r.number]||`${r.char} радикалын сурах үндсэн утга: ${r.mn}. Доорх жишээнд энэ дүрсийн байрлал, хэлбэрийг ажиглаад ханз бүрийн утгыг тусад нь тогтоо. Үгийн утга нь бүрэлдэхүүний утгуудын энгийн нийлбэр байх албагүй.`)}</p>${learnButton('✍ Үндсэн хэлбэрийг бичих',`radicalWrite('${r.char}')`)}<h3>2. Ханз дотор нь ялгаж харъя</h3><p>Улбар шар нь энэ хичээлийн хэсэг; бусад зураас хар. “Толь зүйн радикал” ба “бүрэлдэхүүн”-ийг ялгаж тэмдэглэв.</p>${learnButton(RadicalStudy.color?'Өнгийг нууж өөрийгөө шалгах':'Өнгөөр тодруулах','RadicalStudy.color=!RadicalStudy.color;renderLearn()')}<div class="radical-example-grid">${(RadicalStudy.expanded?lesson.examples:lesson.examples.slice(0,4)).map(e=>`<section class="radical-example-card"><div class="radical-example-glyph">${radicalGlyph(e.char,e.highlight,RadicalStudy.color)}</div><h4><span lang="zh">${e.char}</span> · ${escapeHtml(e.pinyin)}</h4><p>${escapeHtml(e.mn)}</p><p lang="en" class="learn-source">${escapeHtml(e.en)}</p><span class="level-tag">${RADICAL_POSITIONS[e.position]}</span><p class="radical-role">${RADICAL_ROLES[e.role]} · ${e.indexed?'Толь зүйн радикал':'Бүтцийн бүрэлдэхүүн'}</p><p>${e.part} → ${r.char}</p>${learnButton('✍ Бичих',`radicalWrite('${e.char}')`)}${learnButton('🔊 Сонсох',`speakText('${e.words[0]?.text||e.char}')`)}${e.words.length?`<details class="radical-word-tree"><summary>Ханз → үгийн холбоос (${e.words.length})</summary><ul>${e.words.map(w=>`<li><strong lang="zh">${w.text}</strong> · ${escapeHtml(w.pinyin)}<p>${escapeHtml(w.mn)}</p><small>HSK ${String(w.level).replace('_','–')}</small><div>${learnButton('Сонсох',`speakText('${w.text}')`)}${learnButton('Бичих',`radicalWrite('${w.text}')`)}${learnButton(AppState.srsCards.some(c=>c.id===w.id)?'Картнаас хасах':'Картдаа нэмэх',`toggleSRSWord('${w.id}');renderLearn()`)}</div></li>`).join('')}</ul></details>`:'<p class="learn-source">Үндсэн HSK үгийн санд энэ ханзтай холбоос олдоогүй. Лавлах жишээ болгон үзүүлэв.</p>'}</section>`).join('')}</div>${lesson.examples.length>4?learnButton(RadicalStudy.expanded?'Жишээг хураах':'Бүх '+lesson.examples.length+' жишээг харах','RadicalStudy.expanded=!RadicalStudy.expanded;renderLearn()'):''}${comparison?renderRadicalComparison(comparison):''}<h3 id="radical-practice">${comparison?'4':'3'}. Ойлгосноо шалгах</h3><p>Хоёр дасгалыг зөв хийвэл энэ радикалын ахиц хадгалагдана.</p><div class="radical-quiz-glyph">${radicalGlyph(lesson.examples[0].char,lesson.examples[0].highlight,true)}</div>${questions.map((q,i)=>`<fieldset class="lesson-question"><legend>${i+1}. ${q.prompt}</legend><div class="lesson-options">${q.options.map(o=>`<button class="learn-button ${RadicalStudy.answers[i]===o.id?(o.id===q.correct?'answer-right':'answer-wrong'):''}" onclick="answerRadical(${i},${o.id})">${escapeHtml(o.label)}</button>`).join('')}</div>${RadicalStudy.answers[i]!==undefined?`<p role="status">${RadicalStudy.answers[i]===q.correct?'✓ Зөв.':'Дахин оролдоорой.'} ${escapeHtml(q.explanation)}</p>`:''}</fieldset>`).join('')}<div class="radical-completion" role="status">${passed?`<p>✓ Энэ радикалын хоёр дасгалыг давлаа.</p>${learnButton('Дараагийн радикал →','moveRadical(1)')}`:''}</div>${learningProgress()['radical-'+r.number]?learnButton('Энэ радикалын ахицыг буцаах',`resetRadical(${r.number})`):''}<p class="learn-source">Жишээний утгыг одоо байгаа хянасан үгийн сан болон нэмэлт хянасан тайлбараас авсан. Ховор, уламжлалт хэлбэрийг лавлах зорилгоор үзүүлэв.</p></article>`;
}
function answerRadical(index,id) { RadicalStudy.answers[index]=id; renderLearn(); }
function resetRadical(id) { saveLearning('radical-'+id,false); openRadical(id); }
