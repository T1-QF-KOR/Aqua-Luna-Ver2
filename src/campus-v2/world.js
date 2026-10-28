/* Pure calendar and relationship rules. No DOM, storage, or wall-clock time. */
(function (root) {
  'use strict';

  const people = {
    nari: { name: '한나리', short: '나리', color: '#e9a3bb', multiplier: .5 },
    daeun: { name: '오다은', short: '다은', color: '#f2ba87', multiplier: 1 },
    seojin: { name: '백서진', short: '서진', color: '#96d9cc', multiplier: .8 }
  };
  const holidays = {
    '2026-03-02': '삼일절 대체공휴일', '2026-05-05': '어린이날',
    '2026-05-25': '부처님오신날 대체공휴일', '2026-06-03': '지방선거일',
    '2026-08-17': '광복절 대체공휴일', '2026-09-24': '추석 연휴',
    '2026-09-25': '추석', '2026-09-26': '추석 연휴',
    '2026-10-05': '개천절 대체공휴일', '2026-10-09': '한글날',
    '2026-12-25': '성탄절', '2027-01-01': '새해',
    '2027-02-05': '설 연휴', '2027-02-06': '설날',
    '2027-02-07': '설 연휴', '2027-02-08': '설 대체공휴일'
  };
  const broadcasts = [
    ['2026-04-02', '첫 방송'], ['2026-04-09', '첫 사연'],
    ['2026-04-16', '작년의 청취자'], ['2026-04-23', '중간고사'],
    ['2026-04-30', '월말의 빈칸'], ['2026-05-07', '느린 걸음'],
    ['2026-05-14', '5번 레인의 사연'], ['2026-05-21', '축제 다음 날'],
    ['2026-05-28', '봄비'], ['2026-06-04', '말하지 못한 안부'],
    ['2026-06-11', '공지 담당의 사연'], ['2026-06-18', '방학 전 마지막 밤'],
    ['2026-09-03', '다시 만난 목요일'], ['2026-09-10', '여름의 끝'],
    ['2026-09-17', '남의 노래'], ['2026-09-24', '고향의 밤'],
    ['2026-10-01', '가을의 소리'], ['2026-10-08', '마이크에 남은 멜로디'],
    ['2026-10-15', '불 꺼진 복도'], ['2026-10-22', '지난주의 인사'],
    ['2026-10-29', '녹음된 목소리'], ['2026-11-05', '찬 공기'],
    ['2026-11-12', '시험을 앞둔 밤'], ['2026-11-19', '녹음실의 밤'],
    ['2026-11-26', '첫눈'], ['2026-12-03', '남은 달력'],
    ['2026-12-10', '다가오는 성탄'], ['2026-12-17', '기말의 끝'],
    ['2026-12-24', '성탄 특집'], ['2027-02-25', '시즌 마지막 방송']
  ].map(([date, title], i) => ({ id: `radio-${date}`, date, title, number: i + 1,
    special: i >= 28, protected: i >= 28 || i === 23 }));
  const publicEvents = {
    '2026-03-03': '입학식', '2026-03-05': '새내기 배움터',
    '2026-03-10': '동아리 박람회', '2026-04-20': '1학기 중간고사 시작',
    '2026-05-20': '봄 대동제', '2026-06-15': '1학기 기말고사 시작',
    '2026-06-19': '1학기 종강', '2026-06-20': '여름방학 시작',
    '2026-09-01': '2학기 개강', '2026-10-19': '2학기 중간고사 시작',
    '2026-10-28': '가을 축제', '2026-12-14': '2학기 기말고사 시작',
    '2026-12-18': '2학기 종강', '2026-12-19': '겨울방학 시작',
    '2027-02-26': '등록 마감'
  };

  function dateObject(date) { return new Date(`${date}T12:00:00Z`); }
  function validDate(date) {
    return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      !Number.isNaN(dateObject(date).getTime()) && dateObject(date).toISOString().slice(0, 10) === date;
  }
  function addDays(date, amount) {
    const d = dateObject(date);
    d.setUTCDate(d.getUTCDate() + amount);
    return d.toISOString().slice(0, 10);
  }
  function weekday(date) { return dateObject(date).getUTCDay(); }
  function weekKey(date) { return addDays(date, -((weekday(date) + 6) % 7)); }
  function term(date) {
    if (date >= '2026-03-03' && date <= '2026-06-19') return '1학기';
    if (date >= '2026-09-01' && date <= '2026-12-18') return '2학기';
    if (date >= '2026-06-20' && date <= '2026-08-31') return '여름방학';
    if (date >= '2026-12-19') return '겨울방학';
    return '개강 전';
  }
  function inTerm(date) { return ['1학기', '2학기'].includes(term(date)); }
  function hasClass(date) { return inTerm(date) && !holidays[date] && weekday(date) >= 1 && weekday(date) <= 5; }
  function dateLabel(date) {
    const d = dateObject(date);
    return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][weekday(date)]})`;
  }
  function episodeOn(date) { return broadcasts.find(e => e.date === date) || null; }
  function thisWeeksEpisode(date) { return broadcasts.find(e => weekKey(e.date) === weekKey(date)) || null; }
  function calendarMonth(year, month) {
    const first = `${year}-${String(month).padStart(2, '0')}-01`;
    const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return Array.from({ length: count }, (_, i) => {
      const date = addDays(first, i);
      return { date, day: i + 1, weekday: weekday(date), holiday: holidays[date] || null,
        event: publicEvents[date] || null, episode: episodeOn(date), hasClass: hasClass(date) };
    });
  }

  function scheduledAt(state, place) {
    const { date, slot } = state, day = weekday(date);
    if (slot === 3 || holidays[date]) return [];
    return state.met.filter(id => {
      if (id === 'seojin') {
        return (place === 'cafe' && ((slot === 1 && [0, 3, 5, 6].includes(day)) ||
          (slot === 2 && [3, 5, 6].includes(day)))) ||
          (place === 'river' && slot === 2 && [1, 2].includes(day));
      }
      if (!inTerm(date)) {
        if (id === 'nari') return (place === 'club' && [2, 4].includes(day)) ||
          (place === 'concert' && day === 6) || (place === 'river' && slot === 2 && day === 3);
        // A predictable sparse vacation schedule, rather than showing her every day.
        return id === 'daeun' && ((place === 'river' && slot === 1 && day === 6) ||
          (place === 'dining' && slot === 1 && day === 2));
      }
      if (id === 'nari') {
        if (slot === 0) return place === 'class' && [2, 4].includes(day);
        if (date >= '2026-11-16' && date <= '2026-11-19') return false;
        return (place === 'roof' && slot === 1 && [1, 5].includes(day)) ||
          (place === 'studio' && slot === 1 && day === 3) ||
          (place === 'concert' && slot === 1 && day === 6) ||
          (place === 'club' && slot === 2 && [1, 5].includes(day)) ||
          (place === 'cafe' && slot === 2 && day === 3) ||
          (place === 'river' && slot === 2 && day === 0);
        // Thursday's concealed booth location must never appear on the map.
      }
      return id === 'daeun' && ((place === 'class' && slot === 0 && day >= 1 && day <= 5) ||
        (place === 'dining' && slot === 1 && day >= 1 && day <= 4) ||
        (place === 'river' && ((slot === 1 && [5, 6].includes(day)) || (slot === 2 && day === 3))) ||
        (place === 'club' && slot === 2 && [1, 5].includes(day)));
    });
  }
  function presentAt(state, place) {
    return root.AquaEncounters ? root.AquaEncounters.present(state, place) : scheduledAt(state, place);
  }

  const routeOwners = {
    nariClass: ['nari'], nariRoof: ['nari'], nariRiver: ['nari'], nariShake: ['nari'],
    nariVolume: ['nari'], nariHabit: ['nari'], nariLyrics: ['nari'], nariDemo: ['nari'], nariRoom: ['nari'],
    daeunMeet: ['daeun'], daeunFirst: ['daeun'], daeunPhoto: ['daeun'],
    daeunBike: ['daeun'], daeunChat: ['daeun'], seojinMeet: ['seojin'],
    seojinPlaylist: ['seojin'], seojinCup: ['seojin'], seojinRain: ['seojin'],
    crossDrum: ['nari', 'daeun'], crossThursday: ['daeun'], crossRain: ['seojin', 'daeun']
  };
  function clamp(value, max = 100) { return Math.max(0, Math.min(max, value)); }
  function recurringBond(state, id, base) {
    const count = state.seen.filter(scene => (routeOwners[scene] || []).includes(id)).length;
    const cap = Math.min(100, (id === 'nari' ? 15 : 20) + count * (id === 'nari' ? 6 : 8));
    const delta = Math.sign(base) * Math.max(base > 0 ? 1 : 0, Math.round(Math.abs(base * people[id].multiplier)));
    const before = state.bond[id];
    state.bond[id] = delta < 0 ? clamp(before + delta) : Math.max(before, Math.min(cap, before + delta));
    return state.bond[id] - before;
  }
  function bondStage(state, id) {
    const entries = id === 'nari' ? [[75, '고백 직전'], [60, '썸'], [45, '신경 쓰이는 사이'],
      [25, '친구'], [10, '인사하는 사이'], [0, '무대 위의 선배']] :
      [[75, '고백 직전'], [55, '썸'], [35, '신경 쓰이는 사이'], [15, '친구'], [0, '아는 사이']];
    return entries.find(([threshold]) => state.bond[id] >= threshold)[1];
  }

  root.AquaWorld = { people, holidays, broadcasts, publicEvents, dateObject, validDate, addDays,
    weekday, weekKey, term, inTerm, hasClass, dateLabel, episodeOn, thisWeeksEpisode,
    calendarMonth, scheduledAt, presentAt, routeOwners, recurringBond, bondStage, clamp };
})(typeof window !== 'undefined' ? window : globalThis);
