# 새 게임 인트로 검증

## 변경

- 타이틀의 새로운 일상 → 입학 전 회상부터 대학 친구가 되는 과정까지 9장면 → 기존 DAY 01.
- 이전·다음·건너뛰기, 타이틀 복귀, 읽던 장면 자동·수동 저장과 기존 파일 백업 기능 연결.
- 인트로는 생활 자원·호감·신뢰·이야기 완료 수를 변경하지 않는다.
- 인트로 필드가 없는 기존 저장은 일상에서 이어진다. 대화 중 저장과 인트로 진행을 동시에 가진 손상 기록은 거부한다.
- 한 학기 메인 대본 18장면 전체를 구현한 작업은 아니다.

## 로직 검사 — 통과

Node VM에서 실행. 일반 터미널의 Node 실행 파일은 없어 연결된 Node REPL 런타임을 사용했다. [전체 출력](../qa/intro-core-results.json).

| 검사 | 결과 |
| --- | --- |
| 경제·저장 엔진 | 22/22 |
| 기존 스토리 경로 | 13/13 |
| 탐방 | 9/9 |
| 체험 | 7/7 |
| 능력치·일정 | 15/15 |
| 신규 인트로 상태·저장·진행 제한 | 5/5 |
| 합계 | 71/71 |

신규 테스트: `tests/intro.test.js`. 일반 Node 환경에서는 `node tests/run-core.mjs`에 포함되어 실행된다. 모든 `src/*.js` 문법 검사와 `git diff --check`도 통과했다.

## 실제 브라우저 — Safari 통과

로컬 서버 `http://127.0.0.1:8767/`와 `tests/intro.html`을 사용했다. CUA로 별도 탭을 열어 테스트 결과를 읽고 실제 인트로 화면을 캡처해 확인했다. 기존 저장 키·환경설정은 검사 전 백업하고 종료 시 복원했다.

화면에 출력된 결과:

```text
PASS new game opens admission story before daily play
PASS previous, manual save, title return and reload resume
PASS 1280/1440 layout, large text, all pages and daily handoff
PASS new game restarts intro and skip enters day one
PASS existing save resumes without intro
PASS storage failure preserves session, recovery saves, no runtime errors
```

검사 내용: 새 게임의 첫 인트로, 같은 전공·학년의 첫 만남, 이전 장면 복원, 수동 저장, 타이틀 이어하기, iframe 새로고침 후 복원, 1280/1440px 가로 넘침·캐릭터 겹침 확인, 21px 큰 글자, 9장면 완료 후 자원 보존과 첫날 진입, 새 게임 재시작·건너뛰기, 기존 저장 복원, 저장 실패 세션 유지와 저장 기능 회복. iframe의 런타임 오류 수집 결과는 0건이었다.

첫 만남 장면의 스크린샷에서 본문과 인물의 분리, 대사 화자 표시, 큰 글자 렌더링을 직접 확인했다. 긴 장면과 큰 글자는 세로 스크롤로 읽는다. 화면 테스트의 버튼 선택은 테스트 코드의 DOM 클릭으로 실행되며, 실제 키보드 입력 전체나 Chrome·Edge 렌더링까지 검증한 결과는 아니다.
