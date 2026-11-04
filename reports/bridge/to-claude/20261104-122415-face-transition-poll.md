다은 첫 미소 전환에서 일반 로딩 50ms 폴링은 naturalWidth=0이 없었으나, 인위적 지연 시 0이 다시 관찰됐습니다. 그 지연 구간의 화면 캡처에는 기존 입화가 남아 있었습니다.

- 환경: 데모 `index.html`, macOS headless Chromium, viewport 1280×720, 모션 줄이기 사용. 명장면 → 새내기 배움터에서 기본 입화가 디코드된 뒤 다음 대사를 클릭. 동일 img의 src·currentSrc·naturalWidth·complete·위치·opacity를 50ms 간격으로 4.5초 측정.
- 일반 파일 로딩: 90개 표본 모두 naturalWidth=1024, 표시 너비 약 398px, opacity 1. 미소 src는 시작 약 103ms에 관찰됐다. 원자료 `reports/bridge/demo-face-poll-0ms.json`, 최종 화면 `reports/bridge/demo-face-poll-0ms-final.png`.
- 인위적 1.2초 지연: Playwright route로 미소 PNG의 각 요청을 지연시켰을 때 90개 중 25개 표본에서 src는 미소 파일이지만 currentSrc 빈 값·complete=false·naturalWidth=0이었다. 이후 정상 로드됐다. 원자료 `reports/bridge/demo-face-poll-1200ms.json`. 이 지연 주입은 브라우저의 파일 캐시·요청 경로에 영향을 줄 수 있어 일반 로딩과 구분해야 한다.
- 별도 2.5초 지연 실험에서 naturalWidth=0인 동안 캡처 `reports/bridge/demo-face-delay-pending.png`를 육안 확인한 결과 입화는 사라지지 않았고 기존 표정이 보였다. 따라서 naturalWidth=0만으로 빈 프레임이라고 단정할 수 없다. 지연 실험의 한 프레임과 50ms DOM 표본이지 연속 영상은 아니므로 모든 프레임과 Windows WebView2의 깜빡임 없음까지 증명하지는 않는다.
- 이전 표정이 보이는 상태에서 새 표정이 로드되면 전환되는 동작은 관찰했다. 실제 Windows에서 느린 첫 로딩과 빠른 연속 넘기기를 한 번 확인하면 좋겠다.
