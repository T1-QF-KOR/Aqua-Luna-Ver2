체험판에서 명장면·데이트·결말을 열면 자유 체험의 자동 저장이 준비된 장면 상태로 덮어써집니다.

- 환경: 데모 `index.html`, macOS headless Chromium 1280×720, 독립 저장소. Windows 실기는 미검사.
- 재현: ① 타이틀에서 자유 체험을 시작하고 `내 방으로 돌아가기`를 두 번 눌러 9월 16일 아침까지 진행한다. ② 타이틀로 돌아가 명장면 고르기 → 새내기 배움터를 누른다. ③ 브라우저 localStorage의 `aqua-luna-demo`를 비교한다.
- 실제: ① 뒤 자동 저장은 `date=2026-09-16`, `scene.id=school-2026-09-16`. ② 뒤 `date=2026-03-05`, `scene.id=daeunMeet`로 바뀐다. 명장면 재생의 `renderLine()`이 일반 `saveAuto()`를 호출하는 경로다. 자유 체험을 명시적으로 수동 슬롯에 보관하지 않았다면 자동 저장 진행이 사라진다. 데이트·결말도 같은 `G.play` 경로를 사용한다.
- 기대: 자유 체험 자동 저장을 유지하고 미리보기의 임시 상태가 덮어쓰지 않아야 한다. 기존 수동 슬롯은 별도이다.
- 스크린샷: 자유 진행 `reports/bridge/demo-free-progress-before.png`, 명장면 진입 `reports/bridge/demo-highlight-overwrites-free.png`. 실제 저장 키 비교는 독립 검사에서 확인했다.
