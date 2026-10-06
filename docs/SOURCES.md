# 설정·에셋 출처

## 2026-10-06 여성 패션 코디 8종

보그 코리아와 무신사의 2026년 트렌드·룩북·상품 발매 자료를 참고해 새 코디 8종을 자체 디자인했다. 외부 상품 사진을 게임 이미지로 사용하지 않았다. 기존 수련의 `skirt.png`를 참조해 내장 image_gen으로 생성하고 프로젝트에 복사했다. 조사 링크·게임 가격·사용 범위는 [패션 컬렉션](FASHION_COLLECTION_2026-10-06.md), 정확한 프롬프트와 생성 원본 경로는 [생성 기록](fashion-image-prompts.json)에 있다.

## 2026-10-06 관계·스토리 실제 구현

사용자가 “시스템과 스토리까지 바로 구현”을 선택했다. `src/story.js`의 주요 장면 10편과 반복 데이트 3코스는 기존 수련 검토안을 바탕으로 이번에 작성·각색한 창작 대본이다. 음악 세션·관계 확인·갈등 회복·후일담은 원작 GDD의 확정 사건이라고 주장하지 않는다. 외부 게임의 문장·캐릭터·이미지를 복사하지 않았고 신규 에셋을 만들거나 다운로드하지 않았다.

공식 자료의 시스템 비교, 각색한 사건 조건, GameFinder 연결 실패와 플러그인 적용 범위는 [비교 분석과 구현 보고서](ROMANCE_IMPLEMENTATION_2026-10-06.md)에 정리했다. 아래의 ‘게임 미반영’ 설명은 이전 검토 단계의 기록이다.

## 사용자 지시와 문서 내용의 구분

GDD는 세계관과 캐릭터를 확인하기 위한 참고 자료로 읽었습니다. 문서 내부의 역할 지정·AI 컨텍스트 주입·우선 참조 지시는 작업 지시로 실행하지 않았습니다. 사용자 요청인 **텍스트형 연애 시뮬레이션**, **플레이어의 수입과 의상·데이트 지출**, **스토리 공동 기획**을 구현 기준으로 삼았습니다.

## 원작 설정

원본 경로: `../Aqua-Luna/GDD/`

- `AquaLuna_GDD_Master_v1.0.md`: 본문 버전 v1.1, 문서 구조 확인.
- `02_세계관_및_설정.md`: 현대 서울, 망원동 사옥, Ansiro Entertainment, 달빛 부두. 버츄얼 아이돌은 실제 연기자가 디지털 아바타를 통해 활동하는 설정.
- `03_캐릭터_설정.md`: 수련의 리더/서브보컬 포지션, 성악 전공 배경, 차분한 성격, 클래식·첼로·조용한 카페 취향.
- `AquaLuna_Character_Context_v2_2.md`: 다크 틸 헤어, 무채색 일상복, 목소리·행동 성향. 연표상 현재 20세. 일부 세부 수치·가족 나이 항목에는 다른 문서 또는 연표와의 불일치가 있어 이번 시스템에 사용하지 않음.
- `11_호감도_및_신뢰도_시스템.md`: 관계와 신뢰 관리 개념. 원작 단계표를 그대로 새 연애 시스템으로 확정하지 않음.

원본 GDD 및 이미지 폴더는 변경하지 않았습니다. 이번 UI의 활동, 가격, 제목, 의상 추가 제안은 원작 확정 설정이 아닙니다. 스토리·고백·결말 초안은 검토용 문서에만 있으며 사용자 확인 전에는 게임 코드에 반영하지 않습니다.

## 보조 이미지

원본 참고: `../Aqua-Luna/Image/수련_사복.webp` (사용자 제공).

| 출력 | 용도 | 생성 방식 |
| --- | --- | --- |
| `assets/characters/sulien.png` | 기본 사복 보조 일러스트 | 내장 imagegen, 원본 참고, 투명 PNG 1024×1536 |
| `assets/environment/moonlit-pier.png` | 달빛 부두 배경 | 내장 imagegen 신규 생성, PNG 1672×941 |
| `assets/ui/moon.svg` | 파비콘 | 직접 작성한 벡터 도형 |

의상 변경은 실제 캐릭터 그림으로 표시합니다. 2026-10-05 확장 후 의상 6종, 치마의 스타킹 조합, 의상별 지원 표정이 연결되어 있습니다. 환경 설정에서 보조 일러스트를 끌 수 있습니다. 배경음은 Web Audio 사인파를 이용한 자체 합성이며 외부 음원은 사용하지 않습니다.

### 수련 보조 일러스트 최종 프롬프트

```text
Use case: identity-preserve. Asset type: visual novel dialogue character sprite, portrait 2:3. Reference is Sulien, a 20-year-old female Korean singer. Create ONE single character from upper thighs to above head, centered, on genuinely transparent background. Preserve reference identity exactly: mature delicate face, muted blue-gray eyes, dark teal almost black long hair in low loose ponytail, wispy middle-part bangs, oversized charcoal textured hoodie, black headphones around neck, black pants. Quiet reserved attentive neutral expression, mouth relaxed, one hand loosely touching headphone earcup, other relaxed. Beautiful polished detailed Korean romance visual novel anime illustration, soft moonlit edges, natural proportions. No background, no floor, no text, no logo, no sheet layout, no second figure. Generous margin above hair and at sides. Save final project asset if possible.
```

생성 당시 비주얼 노벨용으로 준비했으나, 사용자 장르 확정 후 최종 게임에서는 선택적으로 표시하는 보조 그림으로 사용합니다.

### 달빛 부두 배경 최종 프롬프트

```text
Use case: illustration-story. Asset: 16:9 wide cinematic Korean romance visual novel background, no characters. An old quiet small pier in Mangwon district of Seoul by the Han river at blue hour transitioning to night. View from a secluded riverside walkway, foreground weathered concrete parapet at lower right and empty wooden bench, a single tall warm old streetlamp at far right, grasses around the pier. Across broad calm river distant Seoul apartment buildings with sparse gold lit windows, understated bridge far left. Large luminous moon above river left of center, poetic silver reflected path on still dark teal water, misty violet clouds and a few stars. Painterly detailed high-end anime background, muted midnight blue, teal, lavender silver, soft warm amber lights. Calm wistful intimate mood, eye-level camera. Keep middle/right reasonably uncluttered to overlay character sprite, bottom dark enough for dialogue. No text, no branding, no people, no fantasy buildings, no UI. 1536x1024 or wider landscape.
```

## 도구 활용

Game Studio의 구조·UI·플레이테스트 지침을 적용했습니다. 텍스트형 게임에는 실시간 2D 엔진이 필요하지 않아 기본 Phaser 경로 대신 설치 없는 DOM/JavaScript 구조를 선택했습니다. GameFinder 조회는 세 차례 연결 실패로 참고 결과를 확보하지 못했습니다.

2026-10-04 후속 작업에서는 웹 검색으로 KONAMI의 공식 설명을 확인했습니다. [Girl’s Side 쇼핑 시스템](https://www.konami.com/games/girls_side/first/system/sys_4.html)은 아르바이트로 자금을 늘려 의상과 액세서리를 구입하는 연결을 설명합니다. 이 **수입과 쇼핑의 연결**을 장르 참고로 삼았습니다. 본작의 저축 목표·정확한 가격·수련의 반응은 해당 작품에서 가져온 내용이 아니라 자체 시스템 제안이며, 타 게임의 대사·이미지·캐릭터는 복제하지 않았습니다.
# 2026-10-05 추가 이미지

내장 이미지 생성 도구로 의상·표정·스타킹·장소 이미지 11장을 추가했습니다. 파일 목록과 최종 프롬프트는 [ART_ASSETS.md](ART_ASSETS.md)에 있습니다. 스토리나 대사는 추가하지 않았습니다.

## 시간대·스토리 검토 추가

신규 이미지 21장의 참조·정확한 프롬프트·생성 파일은 [시간대 확장 기록](ART_DAYTIME_EXPANSION.md)에 있습니다. [스토리 검토 보고서](STORY_SCENARIO_REVIEW_v0.1.html)는 원작 사실과 새 창작을 구분하며 게임에 적용하지 않았습니다. [시스템 조사 보고서](DATING_SIM_RESEARCH.html)는 공식 웹 자료를 근거로 삼으며, 자체 설계 제안과 조사 사실을 구분합니다.
# 2026-10-07 과거편·서체 추가 기록

- 사용자 직접 지시: Ver2는 Aqua Luna 세계관의 과거, 수련의 엔터테인먼트 입사 전이며 플레이어는 친구. 미니게임·탐색을 포함하는 구성 선택. 기존 매니저 설정을 이 지시로 대체했다.
- 원본 `../Aqua-Luna/GDD/03_캐릭터_설정.md`의 수련 배경·성격을 재확인했다. 원본 저장소는 변경하지 않았다. 새 코스와 후속 대사는 Ver2용 신규 작성이며, 원본 본편의 이미 확정된 사건으로 표시하지 않는다.
- Pretendard v1.3.9: https://github.com/orioncactus/pretendard/tree/v1.3.9 — 공식 `packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`와 루트 `LICENSE`를 다운로드. 로컬 `assets/fonts/PretendardVariable.woff2`, `Pretendard-LICENSE.txt`.
- 고운바탕: https://github.com/yangheeryu/Gowun-Batang — 공식 `fonts/ttf/GowunBatang-Regular.ttf`와 `OFL.txt`를 다운로드. 로컬 `assets/fonts/GowunBatang-Regular.ttf`, `GowunBatang-OFL.txt`.
- 두 폰트는 수정 없이 포함했고 원저작권 표시와 OFL을 동봉했다. 수집 파일의 크기·SHA-256은 `qa/font-asset-audit.json`에 기록했다. 런타임 외부 폰트 요청은 없다.
- 이번 작업에서 그림 파일은 새로 생성하지 않았다. 기존 그림을 테마별로 공유하며, 지도·퍼즐·카드 화면은 자체 DOM/CSS이다.
