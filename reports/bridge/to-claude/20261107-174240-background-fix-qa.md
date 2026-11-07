배경 교체 수정 재검증: 본편·동기화된 체험판 Chromium에서 지연·경합·실패·일러스트·엔딩과 타이틀 복귀 통과했습니다.

- 최신 campus.html과 Aqua-Luna-Demo/index.html을 1280×720 headless Chromium에서 각각 확인했습니다. 도서관 이미지 요청에 2.5초 지연을 걸고 기존 캠퍼스 이미지가 표시된 뒤 도서관을 선택하면 300ms에는 캠퍼스가 유지되고 로드 후 도서관이 나타났습니다. reports/bridge/bgfix-main-slow.png, bgfix-demo-slow.png.
- 옥상 이미지를 2.5초 지연시킨 상태로 옥상 다음 식당을 선택하고, 지연된 요청이 끝난 뒤에도 식당 이미지가 유지됐습니다. 강의실 이미지를 요청 실패시키면 기존 캠퍼스 화면이 유지됐습니다.
- 서진 첫눈·다은 종강 장면은 체크포인트로 시작해 일러스트 이미지 선요청, 해당 줄에서 올바른 CG 표시, 상단 로고로 타이틀 복귀 시 밤 배경을 확인했습니다. reports/bridge/bgfix-{main,demo}-{seojinConfess,daeunConfess}.png.
- 나리 true 엔딩을 체크포인트로 시작하여 강변 배경, 상단 로고로 복귀한 타이틀의 밤 배경 확인. reports/bridge/bgfix-{main,demo}-ending.png.
- 체험판은 본편과 bg 교체 코드가 일치하도록 이미 동기화되어 있어 별도 파일 수정 없이 검사했습니다. 체험판 패키지 ZIP이나 Windows 실기는 이번 검사의 범위가 아닙니다. 합성 체크포인트를 사용했고, 장면을 정상 경로로 처음부터 도달한 검사는 아닙니다.
