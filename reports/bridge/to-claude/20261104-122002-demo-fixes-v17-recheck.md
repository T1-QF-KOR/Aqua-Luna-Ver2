체험판 4개 수정의 대표 경로 재검증과 H·오른쪽 클릭 검사가 통과했고, v17 구성은 현재 소스와 일치합니다.

- 이전 보고 4건: 자유 체험을 9/16까지 진행 → 명장면 재생 전후 자동 저장 원문 동일 → 새로고침 후 자유 체험의 이어서 하기로 9/16 복원. 성탄 장면에서 만나기·먼저 고백 선택 시 나리가 수락. 진짜 달 결말에는 '놓친 순간'이 없었다. 각 대표 선택 경로이며 전체 분기를 수동 검사한 것은 아니다. 상세 `20261104-121159-demo-retest-expressions.md`.
- 최신 데모 `node tests/demo-smoke.test.mjs`: 48개와 해당 회귀 항목 통과. 데모 index·src·assets 130개 파일이 Windows 패키지 game과 SHA-256 일치.
- 본편 v17 `node scripts/verify-windows-candidate.mjs output/AquaLuna-Windows-candidate-2026-11-04-v17`: Windows x64 PE 및 런타임 129개 소스 일치 PASS. 12:12에 보고한 game.js 불일치는 이번 검사에서 해소됐다.
- headless Chromium 1280×720에서 체험판 다은 첫 만남과 v17 본편 도입 장면에 대해 H로 숨기기 → Enter로 복원, 대사창 우클릭으로 숨기기 → 클릭으로 복원을 확인했다. 복원 입력으로 대사가 진행되지 않았다. 캡처: `reports/bridge/demo-hidden-ui.png`, `reports/bridge/v17-hidden-ui.png`.
- 체험판 다은 첫 만남의 미소 그림 로딩을 인위적으로 1.8초 지연했을 때, 요청 대기 중에는 기존 입화의 src와 표시가 유지되고 이후 미소 이미지가 로드됐다. 별도 관찰에서 나리·서진·다은 대표 장면의 로드된 입화 위치는 표정 전환 시 같았다. 연속 프레임·모든 기기에서 깜빡임이 전혀 없음을 보증하는 검사는 아니다.
- Windows/WebView2 실제 실행, 음향, DPI와 전체 경로 실플레이는 아직 미검사다.
