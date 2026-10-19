# 수련 패션 조사와 이미지 제작 기록

조사 기준: 2026-10-07. 정리 및 게임 반영: 2026-10-11.

## 조사 범위와 해석

국내 패션 판매 카테고리, 시즌 기획전, 스타일링 기사를 함께 확인했다. 아래 목록은 일상 코디에 사용할 대표 품목을 선정한 결과다. 모든 여성의 착용 실태를 전수 조사하거나 판매 순위를 입증한 목록은 아니다.

- [무신사 여성 기획전](https://www.musinsa.com/app/event/campaign/goods/1212?class_no=8): 모자, 짧은 머플러, 헤어 소품, 미니백을 일상 코디 후보로 선정.
- [무신사 26 Spring Edit](https://www.musinsa.com/content/1456522233429979214): 스크런치의 소재와 질감 변형 참고.
- [무신사 가방 장식 기획전](https://store.musinsa.com/app/event/campaign/goods/692?class_no=2): 금속·체인·가죽 계열 가방 장식 참고.
- [무신사 헤어 액세서리 분류](https://www.musinsa.com/category/108003007007/goods?gf=A): 머리끈, 집게핀, 바레트 등 품목 구분 참고.
- [Vogue Korea, 같은 옷을 다르게 입는 스타일링 팁](https://www.vogue.co.kr/2026/09/21/매일-입는-같은-옷-달라-보이는-스타일링-팁-10/): 진주 귀걸이, 브로치, 스카프와 벨트를 수련에게 맞는 절제된 포인트로 해석. 편집 기사이며 보편적 착용률을 뜻하지 않는다.

## 수련에게 적용한 방향

GDD의 차분함, 클래식·첼로·조용한 카페 취향, 엔터테인먼트 입사 전의 일상을 기준으로 차콜·아이보리·네이비·낮은 채도의 청록색과 작은 은색 장식을 사용했다. 특정 브랜드 로고나 상품 디자인을 복제하지 않은 게임용 일러스트다.

독립 PNG 22종: 스크런치, 리본, 집게핀, 바레트, 작은 링 귀걸이, 이어커프, 진주 귀걸이, 달 목걸이, 진주 목걸이, 체인 팔찌, 레이어드 반지, 손목시계, 실크 스카프, 잎 브로치, 얇은 벨트, 타원 안경, 베레모, 볼캡, 숄더백, 캔버스 토트, 나일론 크로스백, 달 참.

추가로 수련의 검은색 헤드셋 아이콘을 제작했다. 헤드셋은 기본 보유·기본 미착용이며 게임에서 장착 가능하다. 다른 신규 소품은 아트 제작 범위로, 별도 구매·자유 조합 시스템을 추가하지 않았다. 일부 소품은 전신 코디에 포함되어 있다.

## 납품과 연결

- [카탈로그](../docs/art-catalog.html): 전신 14종, 포즈 6종, 소품 23종, 배경 2종. 헤드셋 켜기/끄기와 밝은 배경 검토 지원.
- [Figma 보드](https://www.figma.com/design/1RXvK2xXHu7Zk5OjJBtSBE): 전신·포즈·소품 보드.
- [스타일 및 소품 명세](../docs/fashion-accessories-20261007.json), [포즈 제작 프롬프트](../docs/sulien-poses-20261007.json), [헤드셋 분리 명세](../docs/headset-separation.json).
- 게임에서는 모든 의상의 기본 전신 그림과 캐주얼 6개 포즈를 사용한다. 기존 니트·코트·스커트 표정 및 스타킹 조합도 헤드셋 유무에 맞춰 유지한다. 니트·코트의 기존 표정 4종은 원래의 허벅지까지 보이는 구도를 유지한다.

## 생성 방식

내장 image_gen을 사용했다. 캐릭터 이미지를 참조하여 얼굴·머리색·의상·포즈를 유지하고 헤드셋만 제거 또는 추가하는 편집을 수행했다. 투명 PNG를 그대로 보관했으며 자동 크롭·재채색하지 않았다. 기존 원본은 유지했다.

헤드셋 제거 공통 지시: “Remove ONLY the headphones and headphone band around the neck. Restore the sweater or scarf naturally underneath. Keep this exact character face, expression, pose, all clothing including tights, crop, size and composition. Preserve transparency. No headphones anywhere.” 스커트에는 white shirt and cardigan, 캐주얼에는 charcoal hoodie로 복원 대상을 지정했다.

헤드셋 추가 공통 지시: “Add a matte black over-ear headset resting around her neck, two round earcups and headband behind the neck. Preserve exact face, pose, all clothing and jewelry, proportions and fullbody head-to-shoes framing. Only add the headphones as an optional accessory. Transparent background.”

스타일별 의상·소품 설명은 스타일 명세의 outfit/accessories 필드에, 개별 소품·포즈 프롬프트는 각 명세의 prompt 필드에 기록했다. 최초 전신 생성의 원문 전체 프롬프트는 별도 보존되지 않았으므로 의상 설명을 원문 프롬프트로 표기하지 않는다.
