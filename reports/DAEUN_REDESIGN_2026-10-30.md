# 오다은 이미지 재설계

사용자 요청에 따라 얼굴·체형·머리·옷을 새로 설계하고, 이후 의견을 반영해 서진과 닮은 날카롭고 성숙한 방향에서 청순하고 순수한 인상으로 수정했다. 둥근 볼과 부드러운 눈매에 은은한 햄스터상을 넣되 사람의 얼굴로 표현했다. 갈색 어깨 길이 머리·아이보리 머리핀·호박빛 눈·주황 손목밴드로 같은 인물을 알아볼 수 있다. 밝은 대학생 드러머라는 원래 설정과 이야기의 정서는 유지했다.

내장 `image_gen`으로 만든 최종 파일과 [정확한 프롬프트](../docs/daeun-redesign-v7.json):

- [기본 캠퍼스복](../assets/heroines/daeun-campus-v7.png)
- [드럼 연습복](../assets/heroines/daeun-rehearsal-v7.png)
- [여름복](../assets/heroines/daeun-summer-v7.png)
- [겨울 코트](../assets/heroines/daeun-winter-v7.png)
- 선물 의상: [회색 후드·데님 미니](../assets/heroines/daeun-denim-mini-v7.png), [니트 조끼·데님](../assets/heroines/daeun-layered-denim-v7.png), [크림 맨투맨·버뮤다](../assets/heroines/daeun-quarter-bermuda-v7.png)
- [종강 고백 CG](../assets/campus-v2/daeun-term-end-cg-v2.png)

스프라이트는 1024×1536 RGBA이고 배경 모서리가 투명하다. CG는 1672×941 RGB다. 일곱 의상은 기본 표정 그림이며, 아직 별도의 표정 이미지 세트를 만들지는 않았다.

`wardrobe.js`에 일곱 의상을 연결하고 기존 선물 의상 키를 유지했다. 겨울 야외와 종강 고백은 주황 코트를 선택해 장면 설명과 CG가 맞는다. 겨울의 실내 합주에서는 연습복을 유지하고, 플레이어가 선물한 적합한 옷의 선택도 기존 규칙을 따른다. 인물 설정과 아트·의상 문서를 새 외형에 맞췄다.

검증: `node --test tests/campus-v2-wardrobe.test.mjs tests/campus-v2.test.mjs tests/campus-v2-runtime.test.mjs tests/campus-v2-winter.test.mjs` 통과. 선물 구매·착용·저장 복구, 계절 선택, 런타임 44항목과 308일 진행을 확인했다. Safari의 로컬 미리보기에서 종강 장면의 겨울 스프라이트가 렌더링되고 다음 장면에서 새 CG로 바뀌는 것을 실제로 확인했다. `git diff --check` 통과.

별도 전체 자산 검사는 기존에 누락된 `assets/campus-v2/karaoke-v1.png`, `assets/campus-v2/radio-v1.png` 두 배경 때문에 실패한다. 다은의 새 이미지들은 존재 여부를 확인했다. 모바일 화면·모든 이야기 장면의 수동 검수와 별도 표정 세트 제작은 완료 범위에 포함되지 않는다. 진행 중 저장된 장면의 의상 키도 기존 그림 대신 새 카탈로그를 가리킨다.
