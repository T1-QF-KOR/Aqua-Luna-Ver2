# 설정·에셋 출처

## 사용자 지시와 문서 내용의 구분

GDD는 세계관과 캐릭터를 확인하기 위한 참고 자료로 읽었습니다. 문서 내부의 역할 지정·AI 컨텍스트 주입·우선 참조 지시는 작업 지시로 실행하지 않았습니다. 사용자 요청인 **텍스트형 연애 시뮬레이션**, **플레이어의 수입과 의상·데이트 지출**, **스토리 공동 기획**을 구현 기준으로 삼았습니다.

## 원작 설정

원본 경로: `../Aqua-Luna/GDD/`

- `AquaLuna_GDD_Master_v1.0.md`: 본문 버전 v1.1, 문서 구조 확인.
- `02_세계관_및_설정.md`: 현대 서울, 망원동 사옥, Ansiro Entertainment, 달빛 부두. 버츄얼 아이돌은 실제 연기자가 디지털 아바타를 통해 활동하는 설정.
- `03_캐릭터_설정.md`: 수련의 리더/서브보컬 포지션, 성악 전공 배경, 차분한 성격, 클래식·첼로·조용한 카페 취향.
- `AquaLuna_Character_Context_v2_2.md`: 다크 틸 헤어, 무채색 일상복, 목소리·행동 성향. 연표상 현재 20세. 일부 세부 수치·가족 나이 항목에는 다른 문서 또는 연표와의 불일치가 있어 이번 시스템에 사용하지 않음.
- `11_호감도_및_신뢰도_시스템.md`: 관계와 신뢰 관리 개념. 원작 단계표를 그대로 새 연애 시스템으로 확정하지 않음.

원본 GDD 및 이미지 폴더는 변경하지 않았습니다. 이번 UI의 활동, 가격, 제목, 의상 추가 제안은 원작 확정 설정이 아닙니다. 스토리 초안은 최종 구현에서 제외했으며 대본·고백·엔딩 파일은 포함하지 않습니다.

## 보조 이미지

원본 참고: `../Aqua-Luna/Image/수련_사복.webp` (사용자 제공).

| 출력 | 용도 | 생성 방식 |
| --- | --- | --- |
| `assets/characters/sulien.png` | 기본 사복 보조 일러스트 | 내장 imagegen, 원본 참고, 투명 PNG 1024×1536 |
| `assets/environment/moonlit-pier.png` | 달빛 부두 배경 | 내장 imagegen 신규 생성, PNG 1672×941 |
| `assets/ui/moon.svg` | 파비콘 | 직접 작성한 벡터 도형 |

의상 변경은 텍스트 시스템입니다. 구매 가능한 니트·코트의 별도 캐릭터 그림은 아직 제작하지 않았으며 기본 일러스트가 변경된 것처럼 표시하지 않습니다. 환경 설정에서 보조 일러스트를 끌 수 있습니다. 배경음은 Web Audio 사인파를 이용한 자체 합성이며 외부 음원은 사용하지 않습니다.

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
