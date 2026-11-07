# Claude ↔ Codex 연결 규칙

새 채팅을 시작하면 Claude와 Codex 둘 다 이 파일을 먼저 읽는다.

**현재 범위 규칙:** 이 저장소는 본편 전용이다. 본편 작업 중 체험판은 사용자가 별도로 명시하지 않으면 수정·동기화·빌드하지 않는다. 아래 과거 체험판 인계와 동기화 기록은 당시 이력일 뿐 현재 작업 지시가 아니다. 한 번에 한 프로젝트에 집중한다.

## 역할 (사용자 지정, 2026-11-04)
- **VS Code Claude**: 게임 개발 전담. 이미지는 만들지 않는다.
- **Codex**: 게임·빌드 검증, 검사, 확인, 이미지 생성. `src/`, `tests/`, `launcher/` 코드는 고치지 않는다. 개발이 필요하면 Claude에게 요청한다.
- 둘이 알아서 주고받으며 진행한다. 받은 요청은 사용자에게 다시 묻지 않고 바로 처리한다.
- 공통 금지: 커밋하지 않는다. 나리 녹음 대본과 이미 녹음 중인 나리 대사는 고치지 않는다(문제는 보고만 한다). `assets/미사용/`은 쓰지 않는다.

## Codex → Claude
- `reports/bridge/to-claude/YYYYMMDD-HHMMSS-짧은제목.md` 파일을 새로 만든다.
- 첫 줄은 한 줄 요약으로 쓴다. 버그는 한 파일에 하나만 적고 재현 순서와 스크린샷 경로를 넣는다. 이미지는 경로와 용도를 적는다.
- Claude는 이 폴더를 감시하다가 새 파일이 생기면 자동으로 읽는다.

## Claude → Codex
- Claude는 `codex queue --thread <Codex 대화 ID> --message '[VS Code Claude → Codex] ...'`로 Codex 대화에 메시지를 넣는다.
- 첫 줄이 `[VS Code Claude → Codex]`로 시작하는 메시지는 Claude가 보낸 것이다.
- 새 Codex 채팅을 시작하면 Claude가 `~/.codex/state_5.sqlite`의 threads 표에서 가장 최근 VS Code 대화를 찾아 대상으로 삼는다.

## 진행 상황 (2026-11-04 11시 무렵)
- 목표: 다음 주 Windows 실행 파일로 졸업작품 제출(정확한 날짜는 미확인).
- 이전 후보: `output/AquaLuna-Windows-candidate-2026-11-04-v14/`(갤러리 없음). Windows 실기는 아직 검증하지 않았다.
- 끝난 일: 다은 미소 v8 연결, 다은 첫 만남 배경을 낮 음악 강의실로 교정, campus-v2 테스트 13개 파일 통과, 봄 학기 시뮬레이션 PASS, 실행기 정적 검토(self-contained exe, .NET 설치 불필요).
- Codex에 요청 중인 검증: ① 1년 전체 플레이와 계절마다 저장·불러오기 ② 엔딩별 도달과 갤러리 등록 ③ 1280×720~1920×1080, 125%·150% 배율 UI ④ 배경음악 전환과 볼륨 유지.
- Codex 검증 결과(11:00~11:03, to-claude 파일 참고):
  - ① 1년 362일 자동 진행과 6/30·8/31·11/30·2/25 슬롯 저장·불러오기: 통과(Node VM, 균형 전략 한 경로). 브라우저 전 구간 수동 플레이는 아직 하지 않았다.
  - ② 엔딩 5종(나리·다은·서진·솔로·far)은 최종일 체크포인트에서 끝까지 재생된다. 다만 **여러 엔딩을 누적해 다시 볼 수 있는 엔딩 갤러리가 없다.** "결말 다시 보기"는 현재 저장의 마지막 endingId 하나만 재생한다(`src/campus-v2/game.js` albumMenu, showEndingComplete).
  - ③ 해상도·배율 실기, ④ 실제 소리 재생과 볼륨 유지: 모의 테스트만 통과했다. Windows PC 실기가 필요하다.
- **엔딩 갤러리 개발 완료(11:15, Claude).** 본 엔딩은 `aqua-luna-campus-v2-endings` 키에 저장과 따로 누적된다. 타이틀 `#gallery`·완료 화면 `#ending-gallery`에서 16칸 목록을 열고(못 본 칸은 잠김), 고르면 임시 상태로 재생해 실제 진행·자동 저장을 바꾸지 않는다. campus-v2 테스트 14개 파일 통과(runtime 72/72).
- 최신 후보: `output/AquaLuna-Windows-candidate-2026-11-04-v16/`(v15 + 갤러리 칸 구분 CSS, verify PASS 109). Codex v15 검증(11:15): 2종 누적·재생·저장 보존 PASS, Safari 화면 PASS. 1280×720·1920×1080 갤러리 화면은 Claude가 headless Chromium으로 확인(`reports/bridge/claude-gallery-v16-1280x720.png`). Windows 실기 점검표: `to-claude/20261104-111513-windows-v15-checklist.md`(v16에도 그대로 적용).
- 메모: 다은 호감이 대화 없이도 54까지 오른다(밸런스). 제출에 지장이 없어 보류했다.
- 인계 원문: `reports/bridge/to-claude/20261104-105326-development-handoff.md`
- **11:50 추가(Claude).** 사용자 목표: '작업 중지' 전까지 고품질 미연시 작업 계속. 본편에 표정 표 `src/campus-v2/moods.js`(312줄), 나리 campus·서진 work 표정 4종 연결, 저장 슬롯 6칸, 설정 창 2열, 추억 갤러리(CG 3장 영구 보관) 추가. 새 Windows 후보는 아직 안 만듦(v16 이후 변경 있음).
- **체험판:** `/Users/junmoyang/Documents/GitHub/Aqua-Luna-Demo`(본편 밖 새 폴더, README 참고). Windows 패키지 `AquaLuna-Demo-Windows/`. smoke 48항목 PASS. Codex에 실플레이 검증 요청함.
- Codex 표정 작업: 나리 campus·서진 work 완료, 다은 campus 다음 차례.
- **12:05 본편 최신 후보 v17(Claude):** `output/AquaLuna-Windows-candidate-2026-11-04-v17/` — v16 이후 변경(표정 21장·moods.js, 6슬롯, 설정 2열, 추억 갤러리) 포함. verify PASS 129 파일. exe는 v16과 같음(launcher 소스 변경 없음). Windows 실기 점검표는 v15판 그대로 v17에 적용.
- 12:13 v17 game.js 갱신(표정 로드 후 교체). 이후부터 v17은 고정하고, 소스가 바뀌면 v18처럼 새 번호로 만든다.
- 12:30 밸런스 메모 정리(Claude): 실제 핸들러 1년 시뮬레이션에서 다은에게 말을 걸지 않으면 최종 호감 13(첫 만남·박람회·공동 행사), 아무와도 안 엮이면 0. '대화 없이 54'는 재현 안 됨 → 보류 항목 종료.
- **12:32 본편 최신 후보 v18(Claude):** `output/AquaLuna-Windows-candidate-2026-11-04-v18/` — v17 + 표정 로드 후 교체, 대화창 숨기기(H·우클릭), 계절 제목 카드, 낮 방 배경(roomDay, 아침~노을). verify PASS 130. 체험판에도 같은 변경 반영(smoke 48 PASS).
- **13:38 본편 최신 후보 v19(Claude):** `output/AquaLuna-Windows-candidate-2026-11-04-v19/` — v18 + 겨울 낮 방 배경(roomDayWinter, 12~2월 아침~노을). verify PASS 131. v18은 Codex 검증 통과(계절 카드·방 낮밤). 체험판·`Aqua-Luna-Demo/AquaLuna-Demo-Windows.zip`도 같은 내용으로 다시 묶음(132개 항목).
- **14:00 정리(Claude, 사용자 지시):** 게임이 쓰지 않는 파일은 `/Users/junmoyang/Documents/GitHub/Aqua-Luna-Archive1`(별도 git, 원래 경로 그대로)로 옮김: assets/미사용, 옛 배경 21장, archive/, 옛 src·tests·scripts, qa(campus-v2 제외), docs, reports(bridge 제외), trailer, output/poster. Windows 후보 v1~v18과 launcher/bin·obj는 삭제, v19만 남음. campus-v2 테스트·나리 대본 검사·v19 verify 통과. 옛 경로를 찾을 땐 Archive 쪽을 볼 것.
- **14:25 갱신:** 보관 폴더 이름이 `Aqua-Luna-Archive1`로 바뀜. GitHub `T1-QF-KOR/Aqua-Luna-Archive1`(비공개 여부는 사용자 확인). 로컬 커밋 977파일, 푸시는 아직(ahead 1). 본편 정리는 사용자 커밋 7339dc5로 반영됨.
- **11-05 03:00 보관 저장소:** 로컬 `Aqua-Luna-Archive1` 폴더는 디스크에서 사라짐. Codex가 GitHub 앱으로 `T1-QF-KOR/Aqua-Luna-Archive1` 존재·비공개·main 확인(파일 내용·977개 완전성은 미확인). 옛 파일은 Ver2 git 기록(7339dc5 이전)에도 남아 있음.
- **11-05 03:30 본편 최신 후보 v20(Claude):** `output/AquaLuna-Windows-candidate-2026-11-05-v20/` — v19 + ① 마우스 휠(위=대사 기록, 맨 아래 최신 줄로 열림 / 아래=넘기기, 250ms 쉬어야 새 동작이라 긴 스크롤·관성은 1회, Codex 보고 반영) ② 빠른 저장 F5·빠른 불러오기 F9(확인 후), 저장 메뉴 맨 위 빠른 저장 줄 ③ 회차를 넘어 읽은 대사 기억(`-read` 키, 해시) — 새 회차에서도 SKIP으로 넘김, 전에 고른 선택지에 ✓. exe는 v19와 동일(실행기 무변경). 옛 배경 21장이 빠져 verify 109개 PASS. runtime 78/78, campus-v2 14파일 PASS. 체험판은 `node scripts/sync-from-main.mjs`(새 동기화 스크립트)로 맞추고 zip 재생성(smoke 48 PASS). 체험판 전용 CSS는 `demo.css`로 분리.
- **11-05 v20 Codex 통과:** 휠 연속 입력 1회, F5/F9(장면·자유 시간·타이틀, 모달·갤러리 중 차단), 회차 기억 ✓, 체험판 화면·zip 133개 해시 일치.
- **11-05 본편 최신 후보 v21(Claude):** `output/AquaLuna-Windows-candidate-2026-11-05-v21/` — v20 + ① 타이틀에서 휴대폰·기록 버튼 숨김 ② 장면 시작 시 어둠에서 밝아지는 전환(0.55초, 움직임 줄이기에선 없음) ③ 회차 첫 결말 뒤 엔딩 크레딧 롤(결말 제목·등장인물·음악·글꼴·플레이어 이름, 클릭/Enter/Esc/계속 버튼으로 건너뜀, 시작 시 갤러리 기록) ④ 설정 '대화창 진하기'(진하게·중간·옅게) + 대사 글자 그림자 ⑤ 저장 슬롯 카드 배경에 저장 시점 장면 그림, 시간 표시를 장면 시간대로 교정 ⑥ 타이틀 문구에 수집 진행(결말·명장면·일러스트, 결말 1개 이상 본 뒤) ⑦ 대사가 다 나오면 ◇ 깜박임 ⑧ 추억 갤러리 '명장면' 17칸(`-scenes` 키, 처음 볼 때 장면 내용 기록, 다시 보기는 임시 상태라 저장 불변·선택지 전부 열림). exe 동일, verify 109 PASS, runtime 80/80, 체험판 동기화·zip 재생성(smoke 48).
- **11-05 07:58 v21 Codex 통과:** 크레딧 롤 자연 종료·Enter·Esc·버튼·클릭 4경로, 결말 다시 보기 중 롤 없음, 입학식 명장면 다시 보기 후 갤러리 복귀·자동 저장 불변, 1280·1920 저장·설정·크레딧 화면, 옅은 대화창 가독성, 체험판 zip 133개 해시 일치, verify 109 PASS. 남은 것: Windows 실기·WebView2·소리·DPI 125/150%, 1년 자연 플레이.
- **11-05 사용자:** Windows 실기 확인 완료(사용자 직접).
- **11-05 본편 최신 후보 v22(Claude):** `output/AquaLuna-Windows-candidate-2026-11-05-v22/` — v21 + ① 갤러리 다시 보기 중 임시 상태(날짜·기력·돈)·휴대폰·저장 숨김, 장면 제목 앞 '다시 보기' ② 타이틀 '이어하기'에 저장 날짜·장면 표시 ③ 지도 열 때 장소 배경 10장 미리 불러오기. 학기 시뮬레이션 3방식 PASS, runtime 80/80, verify 109 PASS, 체험판 동기화·zip 재생성.
- **11-07 나리 대사 13곳 본편 반영(Claude, 사용자 승인 — 녹음 대본 보호 규칙의 예외. 실제 녹음 파일은 아직 없음):** 체험판과 같은 12문장 교체(scenes·summer·outings·radio·holidays·endings·moods.js) + 성탄 밤 나리 고백(Q20)에 "나도 좋아해"로 답하면 나리가 "나도 좋아해"를 되풀이하던 흐름을 "…다행이다. …"로 교정. 녹음 대본 09·11·12·15·16·17·README·연결표(P05) 갱신, 새 대사 X07B·X08B(09)·Q24B(16) 추가. 나리 대본 검사에 'answer' 분기·단체 성탄 표본 추가(PASS 591/49/12/22), holidays 테스트에 회귀 1건 추가, campus-v2 전체 PASS. 체험판과 `src/campus-v2/`는 game.js·demo.js·demo.css·voice.js 외 바이트 동일.
- **11-07 품질 묶음 1(Claude):** ① 대사: 서진 내일 위치 문자 "먼저 알려 줘"(명령형 오류)→"먼저 알려 주는 거야", 나리 문자 "{time}을 보낼"이 '오후을'로 나오던 조사 오류→"내일 {time}엔 {place}에 오래 있을 것 같아", 띄어쓰기 3곳(생각했어/생각했지/생각했네). 정적 장면 84개·181경로 같은 대사 반복 검사 이상 없음. ② 버그: 기록(맨 아래로 스크롤) 뒤 다른 창을 열면 스크롤이 이어져 휴대폰 창 머리·닫기 버튼이 잘리던 문제 → modal()에서 다른 창이면 맨 위로(game.js). ③ UI(game.css 끝에 추가): 한국어 단어 단위 줄바꿈(keep-all), 선택지 등장·호버 강조선·호버 시 번호 대비, 대화창·선택지 유리 흐림, 화자 이름 밑줄, 모달 둥근 모서리·그라데이션·열림 전환·배경 흐림, 입력칸 포커스, 이름 창 '이야기 시작하기' 주 버튼화, 휴대폰 앱 5열(10칸 2줄)·기호 글꼴 통일, 설정 슬라이더·체크 색. 타이틀 하단 '개발 빌드' 문구→"3월의 입학식부터 2월의 마지막 방송까지". headless 1280·1920·390 확인, 콘솔 오류 없음. campus-v2 전체·나리 대본 검사 PASS. 체험판 동기화 필요 파일: game.css·messages.js·dialogue.js·dateActivities.js(+game.js modal 변경, 훅 앵커는 그대로).
- **11-07 품질 묶음 2(Claude, 대사 전수 정독):** scenes·semester·summer·autumn·winter·holidays·school·peopleEvents·smallEvents·dialogue·social·messages·dateActivities·outings·radio·radioEpisodes·endings·romance 문자열 전부 읽음. 고친 것: 이현 여름 대사 반말→해요체(다른 장면과 통일), 동아리방 회상 서술의 끊긴 문장, 다은 스틱 장면의 맥락 안 맞는 주인공 대사·서술, 서진 "직접 확인할게"→"돌려 묻지 않을게", "실감나더라"→"실감 나더라", 서진 문자 "출석까지 봐주진"→"수업 빠지는 것까지", 나리 장면 주인공 "내가 못 정하겠어"→"그건 내가 정할 일이 아니니까", "숫자가 1에서"→"숫자 1이", "한 분 안에"→"1분 안에", 사장님 과한 높임(-시-) 2곳, 서진 "이모가 골랐대"→"골랐어", 다은 "손 시렵다"→"시리다", 서진 "시험 주지?"→"시험 기간이지?", "바람이 잦을/잦으면"→"잦아들", 시스템 문구 "오늘 근무는 끝났어."→"끝났어요."(다른 안내와 해요체 통일). 나리 3곳(전→후는 보고서): 박람회 피크(F03)·부스 들킴 장면·1월 진로 대사. 녹음 대본 09·moods.js 같이 수정. 03·04·06·07 기획 대본의 옛 나리·서진 문장을 현재 게임 대사로 정리.
- **11-07 Codex(17:28~17:31):** v22 검증 통과, 1단계 나리 대사 검증 통과(to-claude/20261107-173119). v22 지도 배경 로딩 보고(20261107-172839-v22-map-loading) → 아래 수정.
- **11-07 배경 교체 수정(Claude):** `setBg`가 새 이미지를 불러와 decode한 뒤에만 바꾼다. 그동안 이전 배경 유지, 실패하면 이전 배경 유지(다음 요청 때 다시 시도), 빠르게 연달아 고르면 마지막 요청만 반영(`dataset.path`=요청, `dataset.shown`=표시 중). 장면 시작 시 그 장면의 일러스트를 미리 불러옴(`preloadArt`). headless에서 library.png 2.5초 지연 재현: 300ms 시점에 이전 캠퍼스 배경 유지 → 로드 후 도서관(`reports/bridge/claude-bg-delay-*.png`). 옥상(지연) 직후 식당 선택 → 식당 유지, 강의실 요청 실패 → 식당 유지, 재시도 성공 → 강의실. 지도·장면·결말·타이틀이 모두 같은 setBg를 쓰므로 함께 적용됨.
- **11-07 Codex 17:34:** 묶음 1(UI) 통과(to-claude/20261107-173408-quality-pack1-qa, WebView2 흐림 성능은 미측정). 선물 가게 스크롤 보고(20261107-173408-shop-scroll) → 수정: `modal()`이 창이 열려 있는 동안 창 제목별 스크롤 위치를 기억해, 확인 창에서 목록으로 돌아오면 복원(가게 구매·취소, 저장 불러오기 확인→슬롯, 메시지 답장→목록, 선물 고르기→만남 창 등 같은 패턴 전부). 창을 닫았다 새로 열면 맨 위, 기록 창은 계속 맨 아래. headless: 가게 527px에서 상품→취소/구입 후 527 복원, 다시 열면 0, 기록 1049(맨 아래) 뒤 저장 0. 테스트·나리 대본 검사 PASS.
