# Claude ↔ Codex 연결 규칙

새 채팅을 시작하면 Claude와 Codex 둘 다 이 파일을 먼저 읽는다.

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
- **14:00 정리(Claude, 사용자 지시):** 게임이 쓰지 않는 파일은 `/Users/junmoyang/Documents/GitHub/Aqua-Luna-Archive`(별도 git, 원래 경로 그대로)로 옮김: assets/미사용, 옛 배경 21장, archive/, 옛 src·tests·scripts, qa(campus-v2 제외), docs, reports(bridge 제외), trailer, output/poster. Windows 후보 v1~v18과 launcher/bin·obj는 삭제, v19만 남음. campus-v2 테스트·나리 대본 검사·v19 verify 통과. 옛 경로를 찾을 땐 Archive 쪽을 볼 것.
