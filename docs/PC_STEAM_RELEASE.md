# PC 전용 · Steam 출시 준비

기준일: 2026-10-12. 출시 대상은 PC이며 모바일·태블릿 버전은 개발하지 않는다.

## 현재 적용

- 마우스·키보드 조작, 최소 1280×720, 권장 1440×900 이상.
- 작은 창에서도 PC 배치를 유지한다. 화면 높이가 부족하면 세로 스크롤한다.
- 모바일 폭 레이아웃, 터치 전용 스타일 및 모바일 테스트 대상은 제거했다.
- 자원·행동·관계 패널은 왼쪽, 수련의 전신 일러스트는 오른쪽에 배치한다.
- `qa/archive-mobile/`과 과거 보고서는 개발 이력이다. 현재 지원 또는 배포 대상이 아니다.
- 현재 실행본은 HTML/CSS/JavaScript 로컬 브라우저 개발판이다. Steam 실행 파일은 아직 없다.

`python3 scripts/check-pc-only.py`로 모바일 분기 재유입과 PC 기본 설정을 점검한다. 실제 화면 검사는 `tests/ui.html`, `tests/wardrobe.html`, `tests/fashion.html` 등을 1280×720, 1440×900, 1920×1080에서 실행한다. 정적 검사 통과가 화면 QA 통과를 의미하지 않는다.

## Steam 출시 전 남은 작업

1. PC 데스크톱 실행기 및 패키징 방식을 확정하고 실행 파일을 만든다. 브라우저 개발판을 그대로 출시 완료로 간주하지 않는다.
2. 설치·업데이트와 무관한 사용자 저장 경로를 정하고, 기존 JSON 저장 가져오기와 진행 보존을 검증한다. 현재 `localStorage`는 Steam Cloud 연동이 아니다.
3. Steamworks App ID·Depot ID를 발급받은 뒤 실제 실행 파일 경로에 맞춰 Launch Option과 SteamPipe 빌드를 설정한다. 계정 비밀값을 저장소에 넣지 않는다.
4. 깨끗한 PC에서 설치·실행·종료·업데이트·저장 복원과 오프라인 실행을 검증한다. 지원 OS와 최소 사양은 해당 실행 파일 검증 뒤 확정한다.
5. Steam Cloud·도전과제·컨트롤러·Steam Deck은 별도 구현 및 검증 항목이다. 현재 지원 완료로 표시하지 않는다.

Steam은 실행 옵션과 Depot 빌드 구성을 사용한다. [공식 SteamPipe 업로드 문서](https://partner.steamgames.com/doc/sdk/uploading)

Cloud를 도입할 경우 저장 파일 위치와 동기화 범위를 설정해야 한다. [공식 Steam Cloud 문서](https://partner.steamgames.com/doc/features/cloud)
