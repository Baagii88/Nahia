/* Visual presentation only. Study data, scheduling and learning engines stay in their modules. */
function presentationIcon(name){
  const paths={
    learn:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
    vocab:'<path d="M4 4h7v16H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM13 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7Z"/>',
    writer:'<path d="m4 15 11-11 5 5L9 20H4Z"/><path d="m13 6 5 5M4 15l5 5"/>',
    srs:'<rect x="5" y="6" width="15" height="15" rx="2"/><path d="M16 3H4a2 2 0 0 0-2 2v12M9 11h7M9 15h5"/>',
    quiz:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m16 8 5-5M17 3h4v4"/>',
    grammar:'<path d="M4 5h16M4 12h16M4 19h16M8 3v4M16 10v4M10 17v4"/>',
    moon:'<path d="M19 16A8 8 0 0 1 9 5a8 8 0 1 0 10 11Z"/>',
    branch:'<circle cx="12" cy="4" r="2"/><circle cx="5" cy="20" r="2"/><circle cx="19" cy="20" r="2"/><path d="M12 6v6M5 18v-6h14v6"/>',
    radical:'<path d="M4 4h6v6H4ZM14 4h6v6h-6ZM4 14h6v6H4ZM14 14h6v6h-6Z"/>',
    picture:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
    print:'<path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6Z"/><path d="M17 11h1"/>',
    sound:'<path d="m3 9 4 0 5-5v16l-5-5H3ZM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/>'
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]||paths.learn}</svg>`;
}
function renderStudyHome(target){
  const lessons=AppState.grammarLessons,progress=learningProgress();
  const done=lessons.filter(l=>progress[l.id]).length,next=lessons.find(l=>!progress[l.id])||lessons[0];
  const due=dueCards().length,total=getAllWordsPool().length;
  const nextTitle=next?next.title.replace(/^\d+\.\s*/,''):'Ханзаа өдөр бүр давтаарай';
  const actions=[
    ['writer','Ханз бичих','Зураас бүрээр нь дадлага хий.',"switchTab('writer')"],
    ['radical','214 радикал','Ханзны бүрэлдэхүүнийг ялгаж сур.',"learnView('radicals')"],
    ['branch','Үгийн холбоосын мод','Ханзнаас шинэ үг рүү салаал.',"learnView('word-trees')"],
    ['picture','Зурагт карт','250 зурагт картаар тогтоо.',"learnView('pictures')"],
    ['print','Дасгалын хуудас','Өөрийн ханзаар хуудас бэлд.',"learnView('worksheets')"],
    ['sound','Авиа ба зурлага','Pinyin, хөг, үндсэн зурлагаас эхэл.',"learnView('basics')"]
  ];
  target.innerHTML=`<div class="study-home"><div class="study-page-title"><div><p class="study-eyebrow">ӨНӨӨДРИЙН ШИНЭ АЛХАМ</p><h1>Сайн уу, суралцагч.</h1><p class="study-subtitle">Хятад хэлээ хамтдаа бага багаар ахиулъя.</p></div><span class="study-badge">${escapeHtml(next?.level||'HSK 1–9')}</span></div>
    <section class="study-hero"><div class="study-hero-copy"><p class="study-eyebrow">ТАНЫ ДАРААГИЙН ХИЧЭЭЛ</p><h2>${escapeHtml(nextTitle)}</h2><p>Тайлбараа ойлгоод, жишээг сонсож, дасгалаар бататгаарай.</p><button class="study-hero-cta" onclick="${next?`openLesson('${next.id}')`:"switchTab('srs')"}">${done?'Хичээлээ үргэлжлүүлэх':'Эхний хичээлээ эхлэх'} <span aria-hidden="true">→</span></button><small>${done} / ${lessons.length} суурь хичээлийн дасгалыг давсан</small></div><div class="study-hero-art" aria-hidden="true"><div class="study-orbit orbit-one"></div><div class="study-orbit orbit-two"></div><div class="study-hanzi-card"><strong>学</strong><span>xué · сурах</span></div><span class="study-spark">✧</span></div></section>
    <div class="study-overview"><button onclick="learnView('lessons')"><span class="study-tool-icon">${presentationIcon('learn')}</span><span><strong>${done} / ${lessons.length}</strong><small>Суурь хичээлийн ахиц</small></span><span aria-hidden="true">→</span></button><button onclick="switchTab('srs')"><span class="study-tool-icon">${presentationIcon('srs')}</span><span><strong>${due}</strong><small>Одоо давтах карт</small></span><span aria-hidden="true">→</span></button><button onclick="switchTab('vocab')"><span class="study-tool-icon">${presentationIcon('vocab')}</span><span><strong>${total.toLocaleString()}</strong><small>Шинэ HSK үгийн сан</small></span><span aria-hidden="true">→</span></button></div>
    <section class="study-feature-strip"><div><p class="study-eyebrow">ХОЛБООСООР НЬ ТОГТООЁ</p><h2>Нэг ханзнаас олон үг суръя.</h2></div><div><button onclick="WordTree.id='person';WordTree.branch=null;learnView('word-trees')">人 <span>Хүн</span></button><button onclick="WordTree.id='water';WordTree.branch=null;learnView('word-trees')">水 <span>Ус</span></button><button onclick="learnView('word-trees')">Бүх мод <span aria-hidden="true">→</span></button></div></section>
    <div class="study-section-title"><h2>Өнөөдөр юугаар дадлага хийх вэ?</h2><button onclick="learnView('lessons')">Бүх хичээл <span aria-hidden="true">→</span></button></div><div class="study-tools">${actions.map(([icon,title,text,action])=>`<button class="study-tool" onclick="${action}"><span class="study-tool-icon">${presentationIcon(icon)}</span><h3>${title}</h3><p>${text}</p><span class="study-tool-arrow" aria-hidden="true">↗</span></button>`).join('')}</div><p class="study-footnote">Өөрийн хэмнэлээр сур. Сурсан үгээ картдаа нэмээд, өдөр бүр бага багаар давтаарай.</p></div>`;
}
function updatePresentation(tab){
  const names={learn:'Миний хичээл',vocab:'Үгийн сан',writer:'Ханз бичих',srs:'Карт давтах',quiz:'Өөрийгөө сорих',grammar:'Хэлний дүрэм'};
  const sections={home:'Миний хичээл',lessons:'HSK хичээл',lesson:'HSK хичээл',basics:'Авиа ба зурлага',radicals:'214 радикал','radical-lesson':'Радикалаар сурах','word-trees':'Үгийн холбоосын мод',pictures:'Зурагт карт',worksheets:'Дасгалын хуудас'};
  const label=tab==='learn'&&typeof Learn!=='undefined'?sections[Learn.view]||names.learn:names[tab]||names.learn;
  const heading=document.getElementById('workspace-current-view');if(heading)heading.textContent=label;
  document.querySelectorAll('.nav-btn,.bottom-tab-btn').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false'));
}
