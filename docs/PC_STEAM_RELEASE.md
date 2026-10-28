> **2026-10-28 새 기획 연결:** `index.html`은 이제 `src/campus-v2/`의 1학기 개발 빌드를 실행합니다. 실행기 제목·저장 실패 안내와 패키징 대상 폴더를 갱신했지만, 새 Windows EXE의 빌드·실행 검증은 아직 하지 않았습니다. 아래의 예전 실행본 검증 결과는 새 빌드의 검증 결과를 뜻하지 않습니다. [현재 증거](../reports/CAMPUS_FIRST_SEMESTER_2026-10-28.md)

# PC 전용 · Steam 출시 준비

기준일: 2026-10-12. 출시 대상은 PC이며 모바일·태블릿 버전은 개발하지 않는다.

## 현재 적용

- 마우스·키보드 조작, 최소 1280×720, 권장 1440×900 이상.
- 작은 창에서도 PC 배치를 유지한다. 화면 높이가 부족하면 세로 스크롤한다.
- 모바일 폭 레이아웃, 터치 전용 스타일 및 모바일 테스트 대상은 제거했다.
- 화면 배치는 [GDD 10 화면과 조작](../GDD/10_화면_조작.md)을 따른다(1인칭, 캠퍼스 지도, 히로인은 만날 때만 등장).
- `qa/archive-mobile/`과 과거 보고서는 개발 이력이다. 현재 지원 또는 배포 대상이 아니다.
- 2026-10-19: Windows 데스크톱 실행기 추가. `launcher/`(.NET 10 WinForms + WebView2)가 게임 폴더를 고정 주소 `https://aqualuna.example/`로 띄운다. `scripts/build-exe.ps1`이 `dist/AquaLuna/AquaLuna.exe`(자체 포함, 약 50MB)와 `game/`(Live2D 작업 파일 제외, 약 370MB)을 만든다.
  - 저장: WebView2 데이터 폴더 `%LOCALAPPDATA%\AquaLuna\WebView2`의 localStorage. 저장이 이 주소에 묶이므로 **출시 뒤 호스트 이름을 바꾸지 않는다.** 브라우저판 진행은 JSON 내보내기·가져오기로 옮긴다.
  - 창: 기본 1440×900, F11·Alt+Enter 전체 화면, 1280×720 CSS 픽셀보다 작으면 배율을 줄여 배치를 유지. 개발자 도구·우클릭 메뉴·브라우저 단축키(F5, Ctrl+F 등)·확대는 배포판에서 끈다. 외부 링크는 기본 브라우저로 연다.
  - 파일 내보내기는 저장 위치 선택 창을 띄운다. 자동 저장이 실패한 상태로 창을 닫으면 종료 확인을 묻는다.
  - 검증(이 PC): 앱 주소에서 게임 로드, 폰트·이미지 로드, 새 게임·일하기 저장, 종료 후 재실행 이어하기, 작은 창 배율, F11 전환. 저장 위치 선택 창과 종료 확인 창은 수동 확인이 남았다. 깨끗한 PC 검증은 아래 4번.
  - 디버그 빌드에서만 `AQUALUNA_DEVTOOLS_PORT` 환경 변수로 DevTools 포트를 열 수 있다(자동 검사용).

`python3 scripts/check-pc-only.py`로 모바일 분기 재유입과 PC 기본 설정을 점검한다. 실제 화면 검사는 `tests/ui.html`, `tests/wardrobe.html`, `tests/fashion.html` 등을 1280×720, 1440×900, 1920×1080에서 실행한다. 정적 검사 통과가 화면 QA 통과를 의미하지 않는다.

## Steam 출시 전 남은 작업

1. ~~PC 데스크톱 실행기 및 패키징 방식을 확정하고 실행 파일을 만든다.~~ 2026-10-19 첫 실행 파일 완료(위 참조). 코드 서명 인증서와 설치 프로그램은 미정.
2. 사용자 저장 경로는 `%LOCALAPPDATA%\AquaLuna`로 정했다. 기존 JSON 저장 가져오기의 앱 내 검증과 Steam Cloud 대상 경로 확정이 남았다. 현재 저장은 WebView2 내부 localStorage라서 Steam Auto-Cloud에 바로 연결하기 어렵다. Cloud를 쓸 경우 저장을 일반 파일로 내보내는 방식이 필요하다.
3. Steamworks App ID·Depot ID를 발급받은 뒤 실제 실행 파일 경로에 맞춰 Launch Option과 SteamPipe 빌드를 설정한다. 계정 비밀값을 저장소에 넣지 않는다.
4. 깨끗한 PC에서 설치·실행·종료·업데이트·저장 복원과 오프라인 실행을 검증한다. 지원 OS와 최소 사양은 해당 실행 파일 검증 뒤 확정한다.
5. Steam Cloud·도전과제·컨트롤러·Steam Deck은 별도 구현 및 검증 항목이다. 현재 지원 완료로 표시하지 않는다.

Steam은 실행 옵션과 Depot 빌드 구성을 사용한다. [공식 SteamPipe 업로드 문서](https://partner.steamgames.com/doc/sdk/uploading)

Cloud를 도입할 경우 저장 파일 위치와 동기화 범위를 설정해야 한다. [공식 Steam Cloud 문서](https://partner.steamgames.com/doc/features/cloud)
