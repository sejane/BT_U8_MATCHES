const matches = [
  ['09-13','08:40','07:40','LS 紅獅',0,'4','乙B'],
  ['09-19','13:40','12:40','TAIPEI PLAYONE',0,'30','乙B'],
  ['09-20','12:50','11:50','樂活龍',0,'50','乙B','紅色'],
  ['10-18','10:20','09:20','銀河射手俱樂部',0,'69','乙A'],
  ['11-08','07:50','06:50','新北銀河',0,'135','乙A',null,'待確認'],
  ['10-04','08:00','07:00','MFA U8',1,null,null,'穿藍、帶紅'],
  ['10-25','13:00','12:00','FALCONS UNITED',1,null,null,'球員：紅色／守門員：藍色'],
  ['11-08','09:00','08:00','MFA U7',1,null,null,null,'確認改期'],
  ['11-15','12:00','11:00','MONSTER 足球俱樂部',1],
  ['11-22','17:00','16:00','LION',1],
  ['12-06',null,null,'對手待公布',1,null,null,null,'預留'],
  ['12-13',null,null,'對手待公布',1,null,null,null,'預留'],
  ['2027-01-10',null,null,'對手待公布',1,null,null,null,'預留'],
  ['2027-01-17',null,null,'對手待公布',1,null,null,null,'預留'],
  ['2027-01-24',null,null,'對手待公布',1,null,null,null,'預留'],
  ['2027-02-14',null,null,'對手待公布',1,null,null,null,'預留'],
  ['2027-02-21',null,null,'對手待公布',1,null,null,null,'預留'],
  ['2027-03-07',null,null,'對手待公布',1,null,null,null,'預留']
].map(([date,time,meet,opponent,league,round,field,jersey,status],index) => ({
  date,time,meet,opponent,league,round,field,jersey,status,index,
  kickoff: time ? Date.parse(`${date.length === 5 ? '2026-' : ''}${date}T${time}:00+08:00`) : null
}));
const newTaipeiScores = {
  '09-13': [1,5],
  '09-19': [6,2],
  '09-20': [10,1],
  '10-18': [1,8]
};
// Enter confirmed results as [BT SPIRIT goals, opponent goals].
const victoryScores = {
  '10-04': [3,1]
};
function renderNewTaipeiRecord() {
  const scores = Object.values(newTaipeiScores);
  const wins = scores.filter(([forGoals,against]) => forGoals > against).length;
  const draws = scores.filter(([forGoals,against]) => forGoals === against).length;
  const losses = scores.length - wins - draws;
  document.getElementById('record-summary').textContent = `已賽 ${scores.length} 場 · ${wins} 勝 ${draws} 和 ${losses} 敗`;
  document.getElementById('record-points').textContent = wins * 3 + draws;
  document.querySelectorAll('.league:first-child .game').forEach((row,index) => {
    const result = row.querySelector('.result');
    const score = newTaipeiScores[matches[index].date];
    if (result && score) result.textContent = `${score[0]} : ${score[1]}`;
  });
}
function renderVictoryRecord(now) {
  const played = matches.filter(m => m.league === 1 && m.kickoff !== null && m.kickoff <= now);
  const scores = played.map(m => victoryScores[m.date]).filter(Boolean);
  const wins = scores.filter(([forGoals,against]) => forGoals > against).length;
  const draws = scores.filter(([forGoals,against]) => forGoals === against).length;
  const losses = scores.length - wins - draws;
  const pending = played.length - scores.length;
  document.getElementById('victory-summary').textContent = pending
    ? `已完成 ${played.length} 場 · ${pending} 場比分待確認`
    : `已賽 ${scores.length} 場 · ${wins} 勝 ${draws} 和 ${losses} 敗`;
  document.getElementById('victory-points').textContent = pending ? '—' : wins * 3 + draws;
}
function nextMatch(now) {
  return matches.filter(m => m.kickoff !== null && m.kickoff > now).sort((a,b) => a.kickoff-b.kickoff)[0];
}
let displayedIndex;
function refreshSchedule() {
  const now = Date.now();
  renderVictoryRecord(now);
  const next = nextMatch(now);
  const key = next?.index ?? -1;
  if (displayedIndex === key) return;
  displayedIndex = key;
  document.querySelectorAll('.game').forEach((row,index) => {
    row.classList.toggle('past', matches[index].kickoff !== null && matches[index].kickoff <= now);
    row.classList.toggle('today', index === next?.index);
  });
  const panel = document.querySelector('.next');
  if (!next) {
    panel.innerHTML = '<div class="next-main"><div class="eyebrow">NEXT MATCH · 下一場</div><h2>目前沒有後續賽程</h2><p>等待新賽程公布。</p></div>';
    return;
  }
  const weekday = new Intl.DateTimeFormat('zh-TW', {timeZone:'Asia/Taipei',weekday:'short'}).format(next.kickoff);
  const league = next.league ? '2026/27 勝利聯賽 · U8 A 組' : '新北市兒少草地五人制足球聯賽 · U8';
  const venue = next.league
    ? '福斯球場'
    : `新莊田徑場人工草皮足球場${next.field ? ` · ${next.field} · 場次 ${next.round}` : ''}`;
  const official = next.league ? '<a class="chip-link" href="https://taipei.torneopal.com/taso/joukkue.php?joukkue=175284&amp;turnaus=mfa_0014&amp;sarja=U8" target="_blank" rel="noopener noreferrer">官方最新時間與比分 ↗</a>' : '';
  const status = next.status ? `<span class="chip">${next.status}</span>` : '';
  const jersey = next.jersey?.startsWith('球員：') ? next.jersey : `球衣：${next.jersey || '待通知'}`;
  panel.innerHTML = `<div class="next-main"><div class="eyebrow">NEXT MATCH · 下一場</div><div class="date">${next.date.replace(/-/g,'/')} <small>${weekday}</small></div><div class="match"><span>BT SPIRIT 風速羊</span><span class="vs">VS</span><span>${next.opponent}</span></div></div><div class="next-side"><small>${league}</small><span class="meet-label">集合時間</span><strong class="meet-time">${next.meet}</strong><span class="kickoff">${next.time} 開賽</span><span class="venue">📍 場地：${venue}</span><div class="chips">${status}<span class="chip">${jersey}</span><span class="chip">台灣時間</span>${official}</div></div>`;
}
renderNewTaipeiRecord();
refreshSchedule();
setInterval(refreshSchedule, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshSchedule(); });
window.addEventListener('pageshow', refreshSchedule);
